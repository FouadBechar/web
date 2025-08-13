import { prisma } from "../prisma.js";
import { commentSchema } from "../utils/validators.js";
export async function addComment(req, res, next) {
  try {
    const parsed = commentSchema.parse({ ...req.body, postId: Number(req.body.postId) });
    const comment = await prisma.comment.create({ data: { content: parsed.content, postId: parsed.postId, authorId: req.user.id } });
    res.status(201).json(comment);
  } catch (e) { next(e); }
}
