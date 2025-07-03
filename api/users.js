import { createUser, getUserByUsernameAndPassword } from '#db/queries/users';
import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";
import express from "express";
const router = express.Router();
export default router;

router
.route("/register")
.post(requireBody(["username", "password"]), async(req, res)=>{
  const {username, password} = req.body;
  const user = await createUser(username, password);
  // we leave out await here because it's not needed, as per linter
  const token = createToken({ id: user.id });
  res.status(201).send(token);
});

router
.route("/login")
.post(requireBody(["username", "password"]), async (req, res) => {
  const {username, password} = req.body;
  // attempt to get user
  const user = await getUserByUsernameAndPassword(username, password);
  // if no user, finish with response, 401 status and appropriate message
  if(!user) return res.status(401).send("Invalid username or password");
  // if user, create token and send back with 200 status (default)
  const token = createToken({ id: user.id });
  res.send(token);
});
