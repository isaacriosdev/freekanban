import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./app-errors";
import { ZodError } from "zod";

/**
 * Global error handler for Fastify
 * Handles AppError instances, ZodError, and generic errors
 */
export function errorHandler(
    error: Error | FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    // Log the error for debugging
    console.error("Error:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
    });

    // Handle custom AppError instances
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            error: error.code,
            message: error.message,
        });
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return reply.status(400).send({
            error: "VALIDATION_ERROR",
            message: "Error de validación",
            issues: error.issues,
        });
    }

    // Handle Fastify validation errors
    if ("validation" in error && error.validation) {
        return reply.status(400).send({
            error: "VALIDATION_ERROR",
            message: error.message,
            validation: error.validation,
        });
    }

    // Default to 500 Internal Server Error
    return reply.status(500).send({
        error: "INTERNAL_SERVER_ERROR",
        message: "Error interno del servidor",
    });
}
