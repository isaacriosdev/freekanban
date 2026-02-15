import { FastifyInstance } from "fastify";
import { ClientService } from "./clients.services";
import { ClientRepository } from "./clients.repositories";
import { z } from "zod";

// ----------------------------
// Schemas de validación
// ----------------------------

// GET /clients/:id
const clientIdParamsSchema = z.object({
    id: z.string().trim().min(1, "El id es obligatorio"),
});

// POST /clients
const createClientSchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
});

// PUT /clients/:id
const updateClientParamsSchema = z.object({
    id: z.string().trim().min(1, "El id es obligatorio"),
});

const updateClientBodySchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
});

// DELETE /clients/:id
const deleteClientParamsSchema = z.object({
    id: z.string().trim().min(1, "El id es obligatorio"),
});

/**
 * Routes/Handlers for Clients feature
 */
export async function clientsHandlers(app: FastifyInstance) {
    // Repo + Service wiring
    const repo = new ClientRepository();
    const service = new ClientService(repo);

    // ----------------------------
    // GET /clients
    // ----------------------------

    app.get("/clients", async () => {
        return service.getAllClients();
    });

    // ----------------------------
    // POST /clients
    // ----------------------------

    app.post("/clients", async (req, reply) => {
        const parsed = createClientSchema.safeParse(req.body);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        const client = await service.createClient(parsed.data);
        return reply.status(201).send(client);
    });

    // ----------------------------
    // PUT /clients/:id
    // ----------------------------

    app.put<{ Params: { id: string }; Body: { name: string } }>("/clients/:id", async (req, reply) => {
        // Validar params
        const parsedParams = updateClientParamsSchema.safeParse(req.params);

        if (!parsedParams.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsedParams.error.issues,
            });
        }

        const { id } = parsedParams.data;

        // Validar body
        const parsedBody = updateClientBodySchema.safeParse(req.body);

        if (!parsedBody.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsedBody.error.issues,
            });
        }

        const updated = await service.updateClient(id, parsedBody.data);
        return reply.send(updated);
    });

    // ----------------------------
    // DELETE /clients/:id
    // ----------------------------
    app.delete<{ Params: { id: string } }>("/clients/:id", async (req, reply) => {
        // Validar params
        const parsed = deleteClientParamsSchema.safeParse(req.params);

        if (!parsed.success) {
            return reply.status(400).send({
                error: "Validation error",
                issues: parsed.error.issues,
            });
        }

        const { id } = parsed.data;

        await service.deleteClient(id);
        return reply.status(204).send();
    });
}
