/**
 * Base class for all application errors
 */
export abstract class AppError extends Error {
    abstract statusCode: number;
    abstract code: string;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 404 - Resource not found
 */
export class NotFoundError extends AppError {
    statusCode = 404;
    code = "NOT_FOUND";

    constructor(resource: string, identifier?: string) {
        const message = identifier
            ? `${resource} con identificador '${identifier}' no existe`
            : `${resource} no existe`;
        super(message);
    }
}

/**
 * 409 - Resource already exists (conflict)
 */
export class ConflictError extends AppError {
    statusCode = 409;
    code = "CONFLICT";

    constructor(resource: string, field?: string) {
        const message = field
            ? `${resource} con ${field} ya existe`
            : `${resource} ya existe`;
        super(message);
    }
}

/**
 * 400 - Bad request / Validation error
 */
export class ValidationError extends AppError {
    statusCode = 400;
    code = "VALIDATION_ERROR";

    constructor(message: string) {
        super(message);
    }
}

/**
 * 401 - Unauthorized
 */
export class UnauthorizedError extends AppError {
    statusCode = 401;
    code = "UNAUTHORIZED";

    constructor(message: string = "No autorizado") {
        super(message);
    }
}

/**
 * 403 - Forbidden
 */
export class ForbiddenError extends AppError {
    statusCode = 403;
    code = "FORBIDDEN";

    constructor(message: string = "Acceso denegado") {
        super(message);
    }
}

/**
 * 500 - Internal server error
 */
export class InternalServerError extends AppError {
    statusCode = 500;
    code = "INTERNAL_SERVER_ERROR";

    constructor(message: string = "Error interno del servidor") {
        super(message);
    }
}
