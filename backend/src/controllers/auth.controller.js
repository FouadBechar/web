// backend/src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

/* ===================== Helpers ===================== */

const isProd = process.env.NODE_ENV === "production";

function getCookieOptions({ refresh = false } = {}) {
  // Cross-site cookies between Vercel (FE) & Render (BE):
  // sameSite:'none' + secure:true في الإنتاج
  // محليًا: secure:false + sameSite:'lax'
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
  // العمر الافتراضي
  if (refresh) {
    const days = parseRefreshExpToDays(process.env.REFRESH_TOKEN_EXPIRES || "7d");
    base.maxAge = days * 24 * 60 * 60 * 1000;
  } else {
    // نتركها كـ session cookie للـ access token
  }
  return base;
}

function parseRefreshExpToDays(exp) {
  // يدعم قيم مثل "7d" أو رقم بالأيام
  if (!exp) return 7;
  if (/^\d+$/.test(exp)) return Number(exp);
  const m = exp.match(/^(\d+)\s*d$/i);
  return m ? Number(m[1]) : 7;
}

function signAccessToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES || "15m";
  return jwt.sign(payload, secret, { expiresIn });
}

function signRefreshToken(payload) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not set");
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET;
  return jwt.verify(token, secret);
}

function sanitizeUser(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/* ===================== Controllers ===================== */

// POST /api/auth/register
export async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    const normEmail = normalizeEmail(email);

    // Validations
    if (!name || !normEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: normEmail },
    });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normEmail,
        password: hashed,
      },
    });

    // Issue tokens
    const payload = { sub: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Set cookies
    res.cookie("access_token", accessToken, getCookieOptions());
    res.cookie("refresh_token", refreshToken, getCookieOptions({ refresh: true }));

    return res.status(201).json({
      message: "Registered successfully",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/auth/login
export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const normEmail = normalizeEmail(email);

    if (!normEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: normEmail },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Rotate tokens on every login
    res.cookie("access_token", accessToken, getCookieOptions());
    res.cookie("refresh_token", refreshToken, getCookieOptions({ refresh: true }));

    return res.json({
      message: "Logged in",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/auth/logout
export async function logoutUser(req, res, next) {
  try {
    // Clear cookies
    res.cookie("access_token", "", { ...getCookieOptions(), maxAge: 0 });
    res.cookie("refresh_token", "", { ...getCookieOptions({ refresh: true }), maxAge: 0 });

    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/auth/refresh  (اختياري: أضِفه في الراوتر لو حبيت)
export async function refreshSession(req, res, next) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // تأكد أن المستخدم لا يزال موجودًا
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const payload = { sub: user.id, email: user.email };

    // إصدار access جديد و (اختياري) تدوير refresh
    const newAccess = signAccessToken(payload);
    const newRefresh = signRefreshToken(payload);

    res.cookie("access_token", newAccess, getCookieOptions());
    res.cookie("refresh_token", newRefresh, getCookieOptions({ refresh: true }));

    return res.json({
      message: "Session refreshed",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Refresh Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
