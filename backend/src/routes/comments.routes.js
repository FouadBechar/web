import { Router } from "express";
import { addComment } from "../controllers/comments.controller.js";
import { requireAuth } from "../middleware/auth.js";
const r = Router();
r.post("/", requireAuth, addComment);
export default r;
