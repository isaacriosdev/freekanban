import Fastify from "fastify";
import { errorHandler } from "./shared/errors";
import { clientsHandlers } from "./features/clients/clients.handlers";
import { projectHandler } from "./features/projects/projects.handlers";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
    const app = Fastify({
        logger: true,
    });

    // Register error handler
    app.setErrorHandler(errorHandler);

    // Register routes
    await app.register(clientsHandlers);
    await app.register(projectHandler);

    try {
        await app.listen({ port: PORT, host: HOST });
        console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();
