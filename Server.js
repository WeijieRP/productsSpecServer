const express = require("express");
const mysql2 = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
const PORT = process.env.DB_PORT || 3000;

const DBconfig = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// -------------------- CORS --------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.REACT_APP_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
  })
);

// ================= GET =================
app.get("/products", async (req, res) => {
  try {
    const [rows] = await DBconfig.execute("SELECT * FROM products");
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= DELETE =================
app.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await DBconfig.execute(
      "DELETE FROM products WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Deletion operation failed" });
    }

    return res.json({ message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= UPDATE =================
app.put("/products/:id", async (req, res) => {
  try {
    const { productname, category, description, qty } = req.body;
    const id = Number(req.params.id);

    const [result] = await DBconfig.execute(
      "UPDATE products SET productname=?, category=?, description=?, qty=? WHERE id=?",
      [productname, category, description, qty, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Update operation failed" });
    }

    return res.json({ message: "Updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= INSERT =================
app.post("/products", async (req, res) => {
  try {
    const { productname, category, description, qty } = req.body;

    const [result] = await DBconfig.execute(
      "INSERT INTO products (productname, category, description, qty) VALUES (?, ?, ?, ?)",
      [productname, category, description, qty]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Insertion operation failed" });
    }

    return res.json({
      message: "Inserted successfully",
      insertId: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({ message: "404 route cannot be found" });
});

app.listen(PORT, () => {
  console.log(`Server running at PORT ${PORT}`);
});
