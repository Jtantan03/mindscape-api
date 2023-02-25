import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';


export function createloginRouter(pool) {
    
  const router = Router();
  router.post("", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(401).json({ err: "Missing username or password" });
    }
    // Check if the user exists in the database
    const result = await pool.query(
      `SELECT * FROM public.users WHERE username = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ err: "Invalid username or password" });
    }
    // Compare the hashed password stored in the database with the one provided in the request
    const isPasswordMatch = await bcrypt.compare(password, result.rows[0].password);
    if (!isPasswordMatch) {
      return res.status(401).json({ err: "Invalid username or password" });
    }
    // Generate a JSON Web Token (JWT)
    const token = jwt.sign({ user_id: result.rows[ 0 ].id }, process.env.JWT_SECRET, { expiresIn: "22h" });
    res.json({ token });
  });
  return router;
}