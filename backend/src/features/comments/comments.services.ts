import { CommentRepository } from "./comments.repositories";
import { Comment, Prisma } from "../../../generated/prisma";
import { NotFoundError } from "../../shared/errors";

export class CommentService {
    constructor(private commentRepository: CommentRepository) { }

    // Obtener comentarios de una tarea
    async getCommentsByTask(taskId: string): Promise<Comment[]> {
        return this.commentRepository.getCommentsByTask(taskId);
    }

    // Obtener comentario por ID
    async getCommentById(id: string): Promise<Comment> {
        const comment = await this.commentRepository.getCommentById(id);

        if (!comment) {
            throw new NotFoundError("Comentario", id);
        }

        return comment;
    }

    // Crear comentario
    async createComment(data: Prisma.CommentUncheckedCreateInput): Promise<Comment> {
        // Validar que el contenido no esté vacío
        if (!data.content || data.content.trim().length === 0) {
            throw new Error("El contenido del comentario no puede estar vacío");
        }

        return this.commentRepository.createComment({
            ...data,
            content: data.content.trim(),
        });
    }

    // Actualizar comentario
    async updateComment(id: string, data: { content: string }): Promise<Comment> {
        const existingComment = await this.commentRepository.getCommentById(id);

        if (!existingComment) {
            throw new NotFoundError("Comentario", id);
        }

        // Validar que el contenido no esté vacío
        if (!data.content || data.content.trim().length === 0) {
            throw new Error("El contenido del comentario no puede estar vacío");
        }

        return this.commentRepository.updateComment(id, {
            content: data.content.trim(),
        });
    }

    // Eliminar comentario
    async deleteComment(id: string): Promise<void> {
        const existingComment = await this.commentRepository.getCommentById(id);

        if (!existingComment) {
            throw new NotFoundError("Comentario", id);
        }

        await this.commentRepository.deleteComment(id);
    }

    // Contar comentarios de una tarea
    async countCommentsByTask(taskId: string): Promise<number> {
        return this.commentRepository.countCommentsByTask(taskId);
    }
}
