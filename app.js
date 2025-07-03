import express from "express";
const app = express();
export default app;

import usersRouter from "#api/users";
import taskRouter from "#api/tasks";
import getUserFromToken from "#middleware/getUserFromToken";

// parse request payload and req.body
app.use(express.json());
// middleware to find a logged-in user
app.use(getUserFromToken);
// register our routes
app.use("/users", usersRouter);
app.use("/tasks", taskRouter);

// PostgreSQL specific Error-Handling
app.use((err, req, res, next) => {
  switch (err.code) {
    // Invalid type
    case "22P02":
      return res.status(400).send(err.message);
    // Unique constraint violation
    case "23505":
    // Foreign key violation
    case "23503":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

// generic error-handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});
