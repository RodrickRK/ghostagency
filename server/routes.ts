import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTicketSchema, insertUserSchema, insertCommentSchema } from "@shared/schema";
import { ZodError } from "zod";
import bcrypt from "bcrypt";

// Custom request interface with our extensions
interface AuthRequest extends Request {
  session?: {
    userId?: string;
    destroy: (cb: (err?: any) => void) => void;
  };
  userId?: string;
  isAdmin?: boolean;
  isEmployee?: boolean;
  isClient?: boolean;
}

// Extend Express Request type to include our custom properties
declare module 'express-serve-static-core' {
  interface Request {
    session?: {
      userId?: string;
      destroy: (cb: (err?: any) => void) => void;
    };
    userId?: string;
    isAdmin?: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure default users exist
  try {
    // Create admin user
    const adminEmail = 'admin@ghostagency.com';
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      console.log('Creating default admin user...');
      await storage.createUser({
        email: adminEmail,
        password: await bcrypt.hash('adminpass123', 10),
        name: 'Admin User',
        role: 'admin'
      });
      console.log('Default admin user created');
    }

    // Create client user
    const clientEmail = 'client@example.com';
    const existingClient = await storage.getUserByEmail(clientEmail);

    if (!existingClient) {
      console.log('Creating default client user...');
      await storage.createUser({
        email: clientEmail,
        password: await bcrypt.hash('password123', 10),
        name: 'Test Client',
        role: 'client'
      });
      console.log('Default client user created');
    }
  } catch (error) {
    console.error('Error ensuring default users exist:', error);
  }

  // Authentication middleware
  const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    req.userId = req.session.userId;
    next();
  };

  const requireAdminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    console.log('Admin auth check for user:', {
      id: user?.id,
      email: user?.email,
      role: user?.role
    });
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    req.userId = req.session.userId;
    req.isAdmin = true;
    req.isEmployee = false; // Ensure employee flag is false for admin
    console.log('Admin authentication successful');
    next();
  };

  const requireEmployeeAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "employee") {
      return res.status(403).json({ error: "Employee access required" });
    }
    
    req.userId = req.session.userId;
    req.isEmployee = true;
    next();
  };

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      console.log("Login attempt:", { email: req.body.email });
      
      const { email, password } = req.body;
      
      if (!email || !password) {
        console.log("Missing credentials");
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      console.log("User lookup result:", { found: !!user, email });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      console.log("Password validation:", { valid: validPassword });

      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!req.session) {
        console.error("No session object available");
        return res.status(500).json({ error: "Session not initialized" });
      }

      req.session.userId = user.id;
      console.log("Session created:", { userId: user.id });

      if (!user.role) {
        console.error('User has no role:', user);
        return res.status(500).json({ error: "User account is not properly configured" });
      }

      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed", details: process.env.NODE_ENV === 'development' ? error.message : undefined });
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
  app.get("/api/user", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "User ID not found in request" });
      }
      const user = await storage.getUserWithSubscription(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Client authentication middleware
  const requireClientAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "client") {
      return res.status(403).json({ error: "Client access required" });
    }
    
    req.userId = req.session.userId;
    req.isClient = true;
    next();
  };

  // Client ticket endpoints
  app.get("/api/tickets", requireClientAuth, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "User ID not found in request" });
      }
      const tickets = await storage.getTicketsByClient(req.userId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", requireClientAuth, async (req: AuthRequest, res: Response) => {
    try {
      console.log('Creating new ticket for client:', req.userId);
      console.log('Request body:', req.body);
      
      const validatedData = insertTicketSchema.parse({
        ...req.body,
        clientId: req.userId,
        status: "requested",
        attachmentUrls: req.body.attachmentUrls || [] // Handle optional attachment URLs
      });
      
      console.log('Validated ticket data:', validatedData);

      const ticket = await storage.createTicket(validatedData);
      console.log('Ticket created:', {
        id: ticket.id,
        title: ticket.title,
        clientId: ticket.clientId,
        status: ticket.status
      });

      res.json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      if (error instanceof ZodError) {
        console.log('Validation error:', error.errors);
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id/status", requireClientAuth, async (req: AuthRequest, res: Response) => {
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
  app.post("/api/subscriptions/pause", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "User ID not found in request" });
      }
      const subscription = await storage.pauseSubscription(req.userId);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to pause subscription" });
    }
  });

  app.post("/api/subscriptions/resume", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "User ID not found in request" });
      }
      const subscription = await storage.resumeSubscription(req.userId);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to resume subscription" });
    }
  });

  // Admin & Employee shared endpoints
  // Employee tickets endpoint
  app.get("/api/employee/tickets", requireEmployeeAuth, async (req: AuthRequest, res: Response) => {
    try {
      console.log('Employee tickets request from user:', req.userId);
      let tickets = await storage.getAllTickets();
      
      // Filter tickets assigned to this employee
      tickets = tickets.filter(ticket => ticket.assigneeId === req.userId);
      
      console.log('Found employee tickets:', {
        employeeId: req.userId,
        ticketCount: tickets.length,
        tickets: tickets.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          assigneeId: t.assigneeId
        }))
      });
      
      res.json(tickets);
    } catch (error) {
      console.error('Error in employee tickets route:', error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  // Admin tickets endpoint
  app.get("/api/admin/tickets", requireAdminAuth, async (req: AuthRequest, res: Response) => {
    try {
      console.log('Admin tickets request from user:', req.userId);
      console.log('User flags:', { isAdmin: req.isAdmin, isEmployee: req.isEmployee });
      let tickets = await storage.getAllTickets();
      
      // For employees, only show assigned tickets
      // For admins, show all tickets
      if (req.isEmployee) {
        tickets = tickets.filter(ticket => ticket.assigneeId === req.userId);
      } else if (req.isAdmin) {
        // Admin sees all tickets, no filtering needed
        console.log('Admin view - showing all tickets');
      }
      
      console.log('Tickets found:', tickets.length);
      
      // Log some ticket details for debugging
      tickets.forEach(ticket => {
        console.log('Ticket:', {
          id: ticket.id,
          title: ticket.title,
          clientId: ticket.clientId,
          clientName: ticket.client?.name,
          status: ticket.status,
          assigneeId: ticket.assigneeId
        });
      });
      
      res.json(tickets);
    } catch (error) {
      console.error('Error in tickets route:', error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  // Admin-only endpoints
  app.get("/api/admin/employees", requireAdminAuth, async (req: AuthRequest, res: Response) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.patch("/api/admin/tickets/:id/assign", requireAdminAuth, async (req: AuthRequest, res: Response) => {
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

  app.post("/api/tickets/:id/comments", requireClientAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!req.userId) {
        return res.status(401).json({ error: "User ID not found in request" });
      }
      
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
