import bcrypt from "bcrypt";
import db from "#db/client"

export async function createUser(username, password) {
  const sql = `
    INSERT INTO users(username, password) 
    VALUES ($1, $2) 
    RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {rows:[user]} = await db.query(sql, [username, hashedPassword]);
  return user;
}

export async function getUserByUsernameAndPassword(username, password){
  // 1st try to find the user by username indb
  const sql = `
    SELECT *
    FROM users
    WHERE username=$1
  `;
  const {rows:[user]} = await db.query(sql, [username]);
  if(!user) return null;
  // if user is found, try to verify that password is correct
  const isValid = await bcrypt.compare(password, user.password);
  if(!isValid) return null;
  return user;
}

export async function getUserById(id) {
  const sql = `
    SELECT *
    FROM users
    WHERE id=$1
  `;
  const {rows:[user]} = await db.query(sql, [id]);
  return user;
}