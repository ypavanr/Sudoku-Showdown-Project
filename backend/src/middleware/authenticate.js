import db from "../config/pdDB.js";
import bcrypt from 'bcryptjs';
const authenticate = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email does not exist. Please register" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Authenticated",
      username: user.username
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const register = async (req, res) => {
    console.log("Received registration data:", req.body);

  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const emailExists = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const usernameExists = await db.query("SELECT * FROM users WHERE username = $1", [username]);
     if (emailExists.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists. Please log in." });
    }
     if (usernameExists.rows.length > 0) {
      return res.status(409).json({ message: "username already in use. Please choose another username." });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)",
      [email, username, hash]
    );

    return res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export {authenticate, register}