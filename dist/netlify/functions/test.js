// netlify/functions/test.ts
import express from "express";
import serverless from "serverless-http";
var app = express();
app.get("/test", (_req, res) => {
  res.json({ message: "Hello from Netlify Function!" });
});
var handler = serverless(app);
export {
  handler
};
