import { FastifyInstance } from "fastify";
import { z } from "zod";
import { TagService } from "./tags.services";
import { TagRepository } from "./tags.repositories";

// Schemas de validación
const createTagSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(50, "El nombre es muy largo"),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color inválido (formato: #RRGGBB)").optional(),
});

const updateTagSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").max(50, "El nombre es muy largo").optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color inválido (formato: #RRGGBB)").optional(),
});

const assignTagSchema = z.object({
    tagId: z.string().min(1, "ID de etiqueta es requerido"),
});

export async function tagsHandlers(app: FastifyInstance) {
    const repository = new TagRepository();
    const service = new TagService(repository);

    // GET /tags - Obtener todas las etiquetas
    app.get("/tags", async (req, reply) => {
        const tags = await service.getAllTags();
        return reply.status(200).send(tags);
    });

    // GET /tags/:id - Obtener etiqueta por ID
    app.get<{ Params: { id: string } }>("/tags/:id", async (req, reply) => {
        const tag = await service.getTagById(req.params.id);
        return reply.status(200).send(tag);
    });

    // POST /tags - Crear etiqueta
    app.post("/tags", async (req, reply) => {
        const parsed = createTagSchema.safeParse(req.body);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        const tag = await service.createTag(parsed.data);
        return reply.status(201).send(tag);
    });

    // PUT /tags/:id - Actualizar etiqueta
    app.put<{ Params: { id: string } }>("/tags/:id", async (req, reply) => {
        const parsed = updateTagSchema.safeParse(req.body);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        const tag = await service.updateTag(req.params.id, parsed.data);
        return reply.status(200).send(tag);
    });

    // DELETE /tags/:id - Eliminar etiqueta
    app.delete<{ Params: { id: string } }>("/tags/:id", async (req, reply) => {
        await service.deleteTag(req.params.id);
        return reply.status(204).send();
    });

    // GET /tasks/:taskId/tags - Obtener etiquetas de una tarea
    app.get<{ Params: { taskId: string } }>("/tasks/:taskId/tags", async (req, reply) => {
        const tags = await service.getTagsByTask(req.params.taskId);
        return reply.status(200).send(tags);
    });

    // POST /tasks/:taskId/tags - Asignar etiqueta a tarea
    app.post<{ Params: { taskId: string } }>("/tasks/:taskId/tags", async (req, reply) => {
        const parsed = assignTagSchema.safeParse(req.body);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        await service.assignTagToTask(req.params.taskId, parsed.data.tagId);
        return reply.status(204).send();
    });

    // DELETE /tasks/:taskId/tags/:tagId - Remover etiqueta de tarea
    app.delete<{ Params: { taskId: string; tagId: string } }>(
        "/tasks/:taskId/tags/:tagId",
        async (req, reply) => {
            await service.removeTagFromTask(req.params.taskId, req.params.tagId);
            return reply.status(204).send();
        }
    );
}
