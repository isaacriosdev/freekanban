import { FastifyInstance } from "fastify";
import { ClientService } from "./clients.services";
import { ClientRepository } from "./clients.repositories";
import { z } from "zod";

/**
 * Routes/Handlers for Clients feature
 */
export async function clientsHandlers(app: FastifyInstance) {
    // Repo + Service wiring
    const repo = new ClientRepository();
    const service = new ClientService(repo);

    // ----------------------------
    // Schemas
    // ----------------------------

    const createClientSchema = z.object({
        name: z.string().trim().min(1, "El nombre es obligatorio"),
    });

    const updateClientSchema = z.object({
        name: z.string().trim().min(1, "El nombre es obligatorio"),
    });

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

        try {
            const client = await service.createClient(parsed.data);
            return reply.status(201).send(client);
        } catch (err: any) {
            if (err.message === "Cliente ya existe") {
                return reply.status(409).send({ error: err.message });
            }

            throw err;
        }
    });

    // ----------------------------
    // PUT /clients/:id
    // ----------------------------
  
    app.put<{ Params: { id: string } }>("/clients/:id", async (req, reply) => {
        const { id } = req.params;

        const parsed = updateClientSchema.safeParse(req.body);

        if (!parsed.success) {
            return reply.status(400).send({
            error: "Validation error",
            issues: parsed.error.issues,
            });
        }

        try {
            const updated = await service.updateClient(id, parsed.data);
            return reply.send(updated);
        } catch (err: any) {
            if (err.message === "Cliente no existe") {
                return reply.status(404).send({ error: err.message });
            }

            throw err;
        }
    });

    // ----------------------------
    // DELETE /clients/:id
    // ----------------------------
    app.delete<{ Params: { id: string } }>("/clients/:id", async (req, reply) => {
        const { id } = req.params;

        try {
            await service.deleteClient(id);
            return reply.status(204).send();
        } catch (err: any) {
            if (err.message === "El cliente no existe.") {
                return reply.status(404).send({ error: err.message });
            }

            throw err;
        }
    });
}
