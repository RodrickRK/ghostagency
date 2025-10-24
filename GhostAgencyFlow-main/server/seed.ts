import { db } from "./db";
import { users, subscriptions, tickets } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Clearing existing data...");
  
  // Clear existing data
  await db.delete(tickets);
  await db.delete(subscriptions);
  await db.delete(users);
  
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create client user
  const [client] = await db
    .insert(users)
    .values({
      email: "client@example.com",
      password: hashedPassword,
      name: "John Client",
      role: "client",
    })
    .returning();

  console.log("Created client:", client.email);

  // Create subscription for client
  const [subscription] = await db
    .insert(subscriptions)
    .values({
      clientId: client.id,
      status: "active",
      totalDays: 30,
      daysUsed: 10,
      daysRemaining: 20,
    })
    .returning();

  console.log("Created subscription for client");

  // Create employees
  const [employee1] = await db
    .insert(users)
    .values({
      email: "alice@ghostagency.com",
      password: hashedPassword,
      name: "Alice Designer",
      role: "employee",
    })
    .returning();

  const [employee2] = await db
    .insert(users)
    .values({
      email: "bob@ghostagency.com",
      password: hashedPassword,
      name: "Bob Creative",
      role: "employee",
    })
    .returning();

  const [employee3] = await db
    .insert(users)
    .values({
      email: "carol@ghostagency.com",
      password: hashedPassword,
      name: "Carol Artist",
      role: "employee",
    })
    .returning();

  console.log("Created employees:", employee1.email, employee2.email, employee3.email);

  // Create admin user
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@ghostagency.com",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
    })
    .returning();

  console.log("Created admin:", admin.email);

  // Create sample tickets
  const ticketData = [
    {
      clientId: client.id,
      assigneeId: employee1.id,
      title: "Landing Page Redesign",
      description: "Need a modern, minimalist landing page with hero section, features, and CTA. Target audience is tech startups.",
      status: "in_progress" as const,
      priority: "high" as const,
      attachments: ["mockup.png", "brand-guidelines.pdf"],
    },
    {
      clientId: client.id,
      assigneeId: employee2.id,
      title: "Logo Design",
      description: "Create a professional logo for a SaaS company. Modern, clean, and memorable.",
      status: "review" as const,
      priority: "medium" as const,
      attachments: ["inspiration.jpg"],
    },
    {
      clientId: client.id,
      assigneeId: null,
      title: "Social Media Graphics",
      description: "Design social media graphics for Instagram, LinkedIn, and Twitter. 10 posts total.",
      status: "requested" as const,
      priority: "low" as const,
      attachments: [],
    },
    {
      clientId: client.id,
      assigneeId: employee1.id,
      title: "Email Template Design",
      description: "Newsletter template with modular sections. Must be responsive and work across email clients.",
      status: "completed" as const,
      priority: "medium" as const,
      attachments: ["email-examples.pdf"],
    },
  ];

  for (const ticketInfo of ticketData) {
    await db.insert(tickets).values(ticketInfo);
  }

  console.log("Created sample tickets");
  console.log("Seeding complete!");
  console.log("\nLogin credentials:");
  console.log("Client: client@example.com / password123");
  console.log("Admin: admin@ghostagency.com / password123");
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
