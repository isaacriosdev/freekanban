import { FastifyInstance } from "fastify";
import { ClientRepository } from "../clients/clients.repositories";
import { ProjectRepository } from "./projects.repositories";
import { ProjectService } from "./projects.services";
import { z } from "zod";

// ----------------------------
// Schemas de validación
// ----------------------------

// GET /clients/:clientId/projects
const clientIdParamsSchema = z.object({
    clientId: z.string().trim().min(1, "El clientId es obligatorio"),
});

// POST /projects
const createProjectSchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    clientId: z.string().trim().min(1, "El clientId es obligatorio"),
});

// PUT /clients/:clientId/projects/:id
const updateProjectParamsSchema = z.object({
    clientId: z.string().trim().min(1),
    id: z.string().trim().min(1),
});

const updateProjectBodySchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
});

// DELETE /projects/:id
const deleteProjectParamsSchema = z.object({
    id: z.string().trim().min(1, "El id es obligatorio"),
});

export async function projectHandler(app: FastifyInstance) {
    const projectRepo = new ProjectRepository();
    const clientRepo = new ClientRepository();
    const service = new ProjectService(clientRepo, projectRepo);

    // ----------------------------
    // GET /projects
    // ----------------------------

    app.get("/projects", async () => {
        return service.getAllProjects;
    });

    app.get<{ Params: { clientId: string } }>("/clients/:clientId/projects", async (req, reply) => {
        // 1. Validar params
        const parsed = clientIdParamsSchema.safeParse(req.params);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        const { clientId } = parsed.data;

        const projects = await service.getProjectsByClient(clientId);
        return reply.status(200).send(projects);
    });

    // ----------------------------
    // POST /projects
    // ----------------------------

    app.post("/projects", async (req, reply) => {
        const parsed = createProjectSchema.safeParse(req.body);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        const project = await service.createProject(parsed.data);
        return reply.status(201).send(project);
    });

    // ----------------------------
    // PUT /projects
    // ----------------------------

    app.put<{

        Params: { clientId: string; id: string };
        Body: { name: string };

    }>("/clients/:clientId/projects/:id", async (req, reply) => {


        const parsedParams = updateProjectParamsSchema.safeParse(req.params);

        if (!parsedParams.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsedParams.error.issues,
            });
        }

        const { id, clientId } = parsedParams.data;

        const parsedBody = updateProjectBodySchema.safeParse(req.body);

        if (!parsedBody.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsedBody.error.issues,
            });
        }

        const updated = await service.updateProject(clientId, id, parsedBody.data);
        return reply.send(updated);
    });


    // ----------------------------
    // DELETE /projects
    // ----------------------------

    app.delete<{ Params: { id: string } }>("/projects/:id", async (req, reply) => {
        const parsed = deleteProjectParamsSchema.safeParse(req.params);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        const { id } = req.params;

        await service.deleteProject(id);
        return reply.status(204).send();
    });

}
