import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { registerSchema, loginSchema } from "../utils/validators.js";
import { issueToken } from "../middleware/auth.js";
export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(400).json({ message: "Email already in use" });
    const hash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({ data: { ...data, password: hash } });
    issueToken(res, user);
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (e) { next(e); }
}
export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    issueToken(res, user);
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (e) { next(e); }
}
export async function me(req, res) { res.json({ id: req.user.id, email: req.user.email }); }
export async function logout(req, res) { res.clearCookie(process.env.COOKIE_NAME || "token", { path: '/' }); res.json({ message: "Logged out" }); }
