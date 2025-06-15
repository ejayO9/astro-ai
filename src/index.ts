import * as fs from "fs";

import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Hello TypeScript!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});