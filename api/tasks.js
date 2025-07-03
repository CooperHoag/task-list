import requireUser from '#middleware/requireUser';
import express from 'express';
import { createTask, getTasksByUserId, getTaskById, updateTaskById, deleteTaskById } from '#db/queries/tasks';
import requireBody from "#middleware/requireBody";
const router = express.Router();

export default router;

// put before all routes, so that ALL routes are protected
router.use(requireUser);

// GET /tasks
router.route("/").get(async(req, res) => {
  // we need to get tasks
  const tasks = await getTasksByUserId(req.user.id);
  res.send(tasks);
})
  .post(requireBody(["title", "done"]), async(req, res) => {
    const {title, done}= req.body
    const task = await createTask(title, done, req.user.id);
    res.status(201).send(task);
  });

// middleware for requests with the id parmeter

router.param("id", async(req, res, next, id) => {
  const task = await getTaskById(id);
  // send 404 if not found
  if(!task) return res.status(404).send("Task not found.");
  // if there is a task, and its user_id does NOT match the logged-in user's if,
  // send 403 Forbidden
  if (task.user_id !== req.user.id)
    return res.status(403).send("This is not your task.");
  // else, attach the fetched task to the req
  req.task = task;
  // kick the request on to the next step
  next();
});

router.route("/:id").put(requireBody(["title", "done"]), async(req, res) =>{
  const { title, done } = req.body;
  const task = await updateTaskById(req.task.id, title, done);
  res.send(task);
});

router.delete(async (req, res) => {
  const deletedTask = await deleteTaskById(req.task.id);
  res.send(deletedTask);
});