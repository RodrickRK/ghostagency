var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// netlify/functions/api.ts
import express from "express";
import serverless from "serverless-http";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  comments: () => comments,
  commentsRelations: () => commentsRelations,
  insertCommentSchema: () => insertCommentSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertTicketSchema: () => insertTicketSchema,
  insertUserSchema: () => insertUserSchema,
  subscriptionStatusEnum: () => subscriptionStatusEnum,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  ticketPriorityEnum: () => ticketPriorityEnum,
  ticketStatusEnum: () => ticketStatusEnum,
  tickets: () => tickets,
  ticketsRelations: () => ticketsRelations,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var userRoleEnum = pgEnum("user_role", ["client", "admin", "employee"]);
var ticketStatusEnum = pgEnum("ticket_status", ["requested", "in_progress", "review", "completed"]);
var ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high"]);
var subscriptionStatusEnum = pgEnum("subscription_status", ["active", "paused", "cancelled"]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("client"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  totalDays: integer("total_days").notNull().default(30),
  daysUsed: integer("days_used").notNull().default(0),
  daysRemaining: integer("days_remaining").notNull().default(30),
  currentPeriodStart: timestamp("current_period_start").notNull().defaultNow(),
  pausedAt: timestamp("paused_at"),
  resumedAt: timestamp("resumed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assigneeId: varchar("assignee_id").references(() => users.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default("requested"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  attachmentUrls: text("attachment_urls").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var usersRelations = relations(users, ({ many, one }) => ({
  ticketsAsClient: many(tickets, { relationName: "clientTickets" }),
  ticketsAsAssignee: many(tickets, { relationName: "assigneeTickets" }),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.clientId]
  }),
  comments: many(comments)
}));
var subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  client: one(users, {
    fields: [subscriptions.clientId],
    references: [users.id]
  })
}));
var ticketsRelations = relations(tickets, ({ one, many }) => ({
  client: one(users, {
    fields: [tickets.clientId],
    references: [users.id],
    relationName: "clientTickets"
  }),
  assignee: one(users, {
    fields: [tickets.assigneeId],
    references: [users.id],
    relationName: "assigneeTickets"
  }),
  comments: many(comments)
}));
var commentsRelations = relations(comments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [comments.ticketId],
    references: [tickets.id]
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  attachmentUrls: z.array(z.string().url()).optional()
});
var insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
if (process.env.NODE_ENV !== "production") {
  config();
}
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var sql2 = neon(process.env.DATABASE_URL);
var db = drizzle({ client: sql2, schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async getUserWithSubscription(id) {
    const [user] = await db.select().from(users).leftJoin(subscriptions, eq(subscriptions.clientId, users.id)).where(eq(users.id, id));
    if (!user) return void 0;
    return {
      ...user.users,
      subscription: user.subscriptions || void 0
    };
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getEmployees() {
    return db.select().from(users).where(eq(users.role, "employee"));
  }
  // Subscriptions
  async getSubscription(clientId) {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.clientId, clientId));
    return subscription || void 0;
  }
  async createSubscription(insertSubscription) {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }
  async updateSubscription(id, data) {
    const [subscription] = await db.update(subscriptions).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(subscriptions.id, id)).returning();
    return subscription;
  }
  async pauseSubscription(clientId) {
    const subscription = await this.getSubscription(clientId);
    if (!subscription) throw new Error("Subscription not found");
    const [updated] = await db.update(subscriptions).set({
      status: "paused",
      pausedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(subscriptions.clientId, clientId)).returning();
    return updated;
  }
  async resumeSubscription(clientId) {
    const subscription = await this.getSubscription(clientId);
    if (!subscription) throw new Error("Subscription not found");
    const [updated] = await db.update(subscriptions).set({
      status: "active",
      resumedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(subscriptions.clientId, clientId)).returning();
    return updated;
  }
  // Tickets
  async getTicket(id) {
    const [result] = await db.select().from(tickets).leftJoin(users, eq(tickets.clientId, users.id)).leftJoin(users, eq(tickets.assigneeId, users.id)).where(eq(tickets.id, id));
    if (!result) return void 0;
    return {
      ...result.tickets,
      client: result.users,
      assignee: result.users || null
    };
  }
  async getTicketsByClient(clientId) {
    const results = await db.query.tickets.findMany({
      where: eq(tickets.clientId, clientId),
      with: {
        client: true,
        assignee: true
      },
      orderBy: [desc(tickets.createdAt)]
    });
    return results;
  }
  async getAllTickets() {
    const results = await db.query.tickets.findMany({
      with: {
        client: true,
        assignee: true
      },
      orderBy: [desc(tickets.createdAt)]
    });
    return results;
  }
  async createTicket(insertTicket) {
    const [ticket] = await db.insert(tickets).values(insertTicket).returning();
    return ticket;
  }
  async updateTicket(id, data) {
    const [ticket] = await db.update(tickets).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tickets.id, id)).returning();
    return ticket;
  }
  async assignTicket(id, assigneeId) {
    const [ticket] = await db.update(tickets).set({
      assigneeId,
      status: "in_progress",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(tickets.id, id)).returning();
    return ticket;
  }
  // Comments
  async getCommentsByTicket(ticketId) {
    return db.select().from(comments).where(eq(comments.ticketId, ticketId)).orderBy(desc(comments.createdAt));
  }
  async createComment(insertComment) {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { ZodError } from "zod";
import bcrypt from "bcrypt";
async function registerRoutes(app) {
  const requireAuth = async (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    req.userId = req.session.userId;
    next();
  };
  const requireAdminAuth = async (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin" && user.role !== "employee") {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.userId = req.session.userId;
    req.isAdmin = true;
    next();
  };
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
      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });
  app.post("/api/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });
  app.get("/api/user", requireAuth, async (req, res) => {
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
  app.get("/api/tickets", requireAuth, async (req, res) => {
    try {
      const tickets2 = await storage.getTicketsByClient(req.userId);
      res.json(tickets2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });
  app.post("/api/tickets", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTicketSchema.parse({
        ...req.body,
        clientId: req.userId,
        status: "requested",
        attachmentUrls: req.body.attachmentUrls || []
        // Handle optional attachment URLs
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
  app.post("/api/subscriptions/pause", requireAuth, async (req, res) => {
    try {
      const subscription = await storage.pauseSubscription(req.userId);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to pause subscription" });
    }
  });
  app.post("/api/subscriptions/resume", requireAuth, async (req, res) => {
    try {
      const subscription = await storage.resumeSubscription(req.userId);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to resume subscription" });
    }
  });
  app.get("/api/admin/tickets", requireAdminAuth, async (req, res) => {
    try {
      const tickets2 = await storage.getAllTickets();
      res.json(tickets2);
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
  app.post("/api/attachments/validate", requireAuth, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      return res.json({
        success: true,
        url,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error validating attachment URL:", error);
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
  app.get("/api/tickets/:id/comments", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const comments2 = await storage.getCommentsByTicket(id);
      res.json(comments2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });
  app.post("/api/tickets/:id/comments", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        ticketId: id,
        userId: req.userId
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

// netlify/functions/api.ts
var api = express();
api.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
api.use(express.urlencoded({ extended: false }));
api.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});
var handler = async (event, context) => {
  await registerRoutes(api);
  api.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  const serverlessHandler = serverless(api);
  return serverlessHandler(event, context);
};
export {
  handler
};
