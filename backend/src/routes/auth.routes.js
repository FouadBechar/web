// routes/auth.routes.js
import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js";

const router = express.Router();

import { refreshSession } from "../controllers/auth.controller.js";
router.post("/refresh", async (req, res) => {
  try { await refreshSession(req, res); }
  catch (e) { console.error("Refresh Error:", e); res.status(500).json({ message: "Internal server error" }); }
});


// Middleware للتحقق من الحقول المطلوبة
function validateAuthFields(req, res, next) {
  const { name, email, password } = req.body;

  if (req.path === "/register") {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  }

  if (req.path === "/login") {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
  }

  next();
}

// تسجيل مستخدم جديد
router.post("/register", validateAuthFields, async (req, res, next) => {
  try {
    await registerUser(req, res);
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// تسجيل الدخول
router.post("/login", validateAuthFields, async (req, res, next) => {
  try {
    await loginUser(req, res);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// تسجيل الخروج
router.post("/logout", async (req, res, next) => {
  try {
    await logoutUser(req, res);
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
