import {
  users,
  subscriptions,
  tickets,
  comments,
  type User,
  type InsertUser,
  type Subscription,
  type InsertSubscription,
  type Ticket,
  type InsertTicket,
  type TicketWithRelations,
  type UserWithSubscription,
  type Comment,
  type InsertComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserWithSubscription(id: string): Promise<UserWithSubscription | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getEmployees(): Promise<User[]>;

  // Subscriptions
  getSubscription(clientId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription>;
  pauseSubscription(clientId: string): Promise<Subscription>;
  resumeSubscription(clientId: string): Promise<Subscription>;

  // Tickets
  getTicket(id: string): Promise<TicketWithRelations | undefined>;
  getTicketsByClient(clientId: string): Promise<TicketWithRelations[]>;
  getAllTickets(): Promise<TicketWithRelations[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket>;
  assignTicket(id: string, assigneeId: string): Promise<Ticket>;

  // Comments
  getCommentsByTicket(ticketId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserWithSubscription(id: string): Promise<UserWithSubscription | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(subscriptions, eq(subscriptions.clientId, users.id))
      .where(eq(users.id, id));

    if (!user) return undefined;

    return {
      ...user.users,
      subscription: user.subscriptions || undefined,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getEmployees(): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.role, "employee"));
  }

  // Subscriptions
  async getSubscription(clientId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.clientId, clientId));
    return subscription || undefined;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async pauseSubscription(clientId: string): Promise<Subscription> {
    const subscription = await this.getSubscription(clientId);
    if (!subscription) throw new Error("Subscription not found");

    const [updated] = await db
      .update(subscriptions)
      .set({
        status: "paused",
        pausedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.clientId, clientId))
      .returning();

    return updated;
  }

  async resumeSubscription(clientId: string): Promise<Subscription> {
    const subscription = await this.getSubscription(clientId);
    if (!subscription) throw new Error("Subscription not found");

    const [updated] = await db
      .update(subscriptions)
      .set({
        status: "active",
        resumedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.clientId, clientId))
      .returning();

    return updated;
  }

  // Tickets
  async getTicket(id: string): Promise<TicketWithRelations | undefined> {
    const [result] = await db
      .select()
      .from(tickets)
      .leftJoin(users, eq(tickets.clientId, users.id))
      .leftJoin(users, eq(tickets.assigneeId, users.id))
      .where(eq(tickets.id, id));

    if (!result) return undefined;

    return {
      ...result.tickets,
      client: result.users!,
      assignee: result.users || null,
    };
  }

  async getTicketsByClient(clientId: string): Promise<TicketWithRelations[]> {
    const results = await db.query.tickets.findMany({
      where: eq(tickets.clientId, clientId),
      with: {
        client: true,
        assignee: true,
      },
      orderBy: [desc(tickets.createdAt)],
    });

    return results as TicketWithRelations[];
  }

  async getAllTickets(): Promise<TicketWithRelations[]> {
    const results = await db.query.tickets.findMany({
      with: {
        client: true,
        assignee: true,
      },
      orderBy: [desc(tickets.createdAt)],
    });

    return results as TicketWithRelations[];
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const [ticket] = await db.insert(tickets).values(insertTicket).returning();
    return ticket;
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async assignTicket(id: string, assigneeId: string): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({
        assigneeId,
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  // Comments
  async getCommentsByTicket(ticketId: string): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.ticketId, ticketId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }
}

export const storage = new DatabaseStorage();
