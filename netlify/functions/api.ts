import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

const api = express();

// Configure middleware
api.use(express.json({
  verify: (req: any, _res: any, buf: Buffer) => {
    req.rawBody = buf;
  }
}));
api.use(express.urlencoded({ extended: false }));

// Add logging middleware
api.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// Export an async handler that sets up the routes
export const handler = async (event: any, context: any) => {
  // Register routes before handling the request
  await registerRoutes(api);

  // Add error handling
  api.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Create the serverless handler
  const serverlessHandler = serverless(api);
  return serverlessHandler(event, context);
};