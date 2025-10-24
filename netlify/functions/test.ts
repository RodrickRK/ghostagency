import express from "express";
import serverless from "serverless-http";

// Create Express app
const app = express();

// Test route
app.get("/test", (_req, res) => {
  res.json({ message: "Hello from Netlify Function!" });
});

// Export the handler
export const handler = serverless(app);