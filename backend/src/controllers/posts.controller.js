import { prisma } from "../prisma.js";
import { postSchema } from "../utils/validators.js";
export async function listPosts(req, res, next) {
  try {
    const posts = await prisma.post.findMany({ include: { author: { select: { id: true, name: true } }, _count: { select: { comments: true } } }, orderBy: { createdAt: "desc" } });
    res.json(posts);
  } catch (e) { next(e); }
}
export async function getPost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({ where: { id }, include: { author: { select: { id: true, name: true } }, comments: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } } } });
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (e) { next(e); }
}
export async function createPost(req, res, next) { try { const data = postSchema.parse(req.body); const post = await prisma.post.create({ data: { ...data, authorId: req.user.id } }); res.status(201).json(post); } catch (e) { next(e); } }
