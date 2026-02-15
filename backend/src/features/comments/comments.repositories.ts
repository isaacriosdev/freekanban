import { prisma } from "../../shared/database/database";
import { Comment, Prisma } from "../../../generated/prisma";

export class CommentRepository {
    // Obtener todos los comentarios de una tarea
    async getCommentsByTask(taskId: string): Promise<Comment[]> {
        return prisma.comment.findMany({
            where: { taskId },
            orderBy: { createdAt: "desc" },
        });
    }

    // Obtener comentario por ID
    async getCommentById(id: string): Promise<Comment | null> {
        return prisma.comment.findUnique({
            where: { id },
        });
    }

    // Crear comentario
    async createComment(data: Prisma.CommentUncheckedCreateInput): Promise<Comment> {
        return prisma.comment.create({
            data,
        });
    }

    // Actualizar comentario
    async updateComment(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
        return prisma.comment.update({
            where: { id },
            data,
        });
    }

    // Eliminar comentario
    async deleteComment(id: string): Promise<void> {
        await prisma.comment.delete({
            where: { id },
        });
    }

    // Contar comentarios de una tarea
    async countCommentsByTask(taskId: string): Promise<number> {
        return prisma.comment.count({
            where: { taskId },
        });
    }
}
