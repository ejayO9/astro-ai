import * as fs from "fs";
import express from 'express';
import dotenv from 'dotenv';
import chatRoutes from "./routes/chatRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(requestLogger);

// Test route
app.get('/', (req, res) => {
  res.send('Hello TypeScript!');
});

// API routes
app.use("/api", chatRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});