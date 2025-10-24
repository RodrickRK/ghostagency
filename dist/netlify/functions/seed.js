var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// netlify/functions/seed.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

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

// shared/seed.ts
import bcrypt from "bcrypt";
var ADMIN_EMAIL = "admin@ghostagency.com";
var ADMIN_PASSWORD = "adminpass123";
var EMPLOYEE_EMAIL = "employee@ghostagency.com";
var EMPLOYEE_PASSWORD = "employeepass123";
async function seedUsers(db) {
  try {
    console.log("\u{1F331} Starting database seed...");
    const adminExists = await db.query.users.findFirst({
      where: (users2, { eq }) => eq(users2.email, ADMIN_EMAIL)
    });
    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await db.insert(users).values({
        email: ADMIN_EMAIL,
        password: hashedAdminPassword,
        name: "Admin User",
        role: "admin"
      });
      console.log("\u{1F464} Created admin user");
    } else {
      console.log("\u{1F464} Admin user already exists");
    }
    const employeeExists = await db.query.users.findFirst({
      where: (users2, { eq }) => eq(users2.email, EMPLOYEE_EMAIL)
    });
    if (!employeeExists) {
      const hashedEmployeePassword = await bcrypt.hash(EMPLOYEE_PASSWORD, 10);
      await db.insert(users).values({
        email: EMPLOYEE_EMAIL,
        password: hashedEmployeePassword,
        name: "Employee User",
        role: "employee"
      });
      console.log("\u{1F464} Created employee user");
    } else {
      console.log("\u{1F464} Employee user already exists");
    }
    return { success: true, message: "\u2705 Seed completed successfully" };
  } catch (error) {
    console.error("\u274C Seed failed:", error);
    throw error;
  }
}

// netlify/functions/seed.ts
var handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }
  const authHeader = event.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.SEED_AUTH_TOKEN}`) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" })
    };
  }
  try {
    const dbUrl = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL;
    if (!dbUrl) {
      throw new Error("NETLIFY_DATABASE_URL_UNPOOLED or NETLIFY_DATABASE_URL is required");
    }
    const sql2 = neon(dbUrl);
    const db = drizzle(sql2, { schema: schema_exports });
    const result = await seedUsers(db);
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to seed database" })
    };
  }
};
export {
  handler
};
