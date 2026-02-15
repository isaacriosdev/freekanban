import { FastifyInstance } from "fastify";
import { z } from "zod";
import { CommentService } from "./comments.services";
import { CommentRepository } from "./comments.repositories";

// Schemas de validación
const createCommentSchema = z.object({
    content: z.string().min(1, "El contenido es requerido").max(5000, "El contenido es muy largo"),
    taskId: z.string().min(1, "ID de tarea es requerido"),
});

const updateCommentSchema = z.object({
    content: z.string().min(1, "El contenido es requerido").max(5000, "El contenido es muy largo"),
});

export async function commentsHandlers(app: FastifyInstance) {
    const repository = new CommentRepository();
    const service = new CommentService(repository);

    // GET /tasks/:taskId/comments - Obtener comentarios de una tarea
    app.get<{ Params: { taskId: string } }>("/tasks/:taskId/comments", async (req, reply) => {
        const comments = await service.getCommentsByTask(req.params.taskId);
        return reply.status(200).send(comments);
    });

    // GET /comments/:id - Obtener comentario por ID
    app.get<{ Params: { id: string } }>("/comments/:id", async (req, reply) => {
        const comment = await service.getCommentById(req.params.id);
        return reply.status(200).send(comment);
    });

    // POST /comments - Crear comentario
    app.post("/comments", async (req, reply) => {
        const parsed = createCommentSchema.safeParse(req.body);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        const comment = await service.createComment(parsed.data);
        return reply.status(201).send(comment);
    });

    // PUT /comments/:id - Actualizar comentario
    app.put<{ Params: { id: string } }>("/comments/:id", async (req, reply) => {
        const parsed = updateCommentSchema.safeParse(req.body);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        const comment = await service.updateComment(req.params.id, parsed.data);
        return reply.status(200).send(comment);
    });

    // DELETE /comments/:id - Eliminar comentario
    app.delete<{ Params: { id: string } }>("/comments/:id", async (req, reply) => {
        await service.deleteComment(req.params.id);
        return reply.status(204).send();
    });

    // GET /tasks/:taskId/comments/count - Contar comentarios de una tarea
    app.get<{ Params: { taskId: string } }>("/tasks/:taskId/comments/count", async (req, reply) => {
        const count = await service.countCommentsByTask(req.params.taskId);
        return reply.status(200).send({ count });
    });
}
