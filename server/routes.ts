import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTicketSchema, insertUserSchema, insertCommentSchema } from "@shared/schema";
import { ZodError } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    req.userId = req.session.userId;
    next();
  };

  const requireAdminAuth = async (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || (user.role !== "admin" && user.role !== "employee")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    req.userId = req.session.userId;
    req.isAdmin = true;
    next();
  };

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session!.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // User endpoints
  app.get("/api/user", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserWithSubscription(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Client ticket endpoints
  app.get("/api/tickets", requireAuth, async (req: any, res) => {
    try {
      const tickets = await storage.getTicketsByClient(req.userId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertTicketSchema.parse({
        ...req.body,
        clientId: req.userId,
        status: "requested",
        attachmentUrls: req.body.attachmentUrls || [] // Handle optional attachment URLs
      });

      const ticket = await storage.createTicket(validatedData);
      res.json(ticket);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const ticket = await storage.updateTicket(id, { status });
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket status" });
    }
  });

  // Subscription endpoints
  app.post("/api/subscriptions/pause", requireAuth, async (req: any, res) => {
    try {
      const subscription = await storage.pauseSubscription(req.userId);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to pause subscription" });
    }
  });

  app.post("/api/subscriptions/resume", requireAuth, async (req: any, res) => {
    try {
      const subscription = await storage.resumeSubscription(req.userId);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to resume subscription" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/tickets", requireAdminAuth, async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/admin/employees", requireAdminAuth, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.patch("/api/admin/tickets/:id/assign", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { assigneeId } = req.body;

      if (!assigneeId) {
        return res.status(400).json({ error: "Assignee ID is required" });
      }

      const ticket = await storage.assignTicket(id, assigneeId);
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign ticket" });
    }
  });

  // Attachment URL validation endpoint
  app.post("/api/attachments/validate", requireAuth, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Here we could add additional validation:
      // - Check file size
      // - Validate file type
      // - Scan for malware
      // - etc.

      return res.json({
        success: true,
        url: url,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error validating attachment URL:', error);
      res.status(500).json({ error: "Failed to validate attachment URL" });
    }
  });

  app.patch("/api/admin/tickets/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await storage.updateTicket(id, req.body);
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  // Comments endpoints
  app.get("/api/tickets/:id/comments", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getCommentsByTicket(id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/tickets/:id/comments", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        ticketId: id,
        userId: req.userId,
      });

      const comment = await storage.createComment(validatedData);
      res.json(comment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
