# Sistema de Errores Estandarizado

Este proyecto utiliza un sistema de errores estandarizado para manejar errores de manera consistente en toda la aplicación.

## Clases de Error Disponibles

### `NotFoundError` (404)
Se usa cuando un recurso no existe.

```typescript
throw new NotFoundError("Cliente", clientId);
// Resultado: "Cliente con identificador 'abc123' no existe"

throw new NotFoundError("Proyecto");
// Resultado: "Proyecto no existe"
```

### `ConflictError` (409)
Se usa cuando hay un conflicto, como intentar crear un recurso duplicado.

```typescript
throw new ConflictError("Cliente", "este nombre");
// Resultado: "Cliente con este nombre ya existe"

throw new ConflictError("Proyecto");
// Resultado: "Proyecto ya existe"
```

### `ValidationError` (400)
Se usa para errores de validación personalizados (Zod se maneja automáticamente).

```typescript
throw new ValidationError("El formato del email es inválido");
```

### `UnauthorizedError` (401)
Se usa cuando el usuario no está autenticado.

```typescript
throw new UnauthorizedError();
// Resultado: "No autorizado"

throw new UnauthorizedError("Token inválido");
```

### `ForbiddenError` (403)
Se usa cuando el usuario no tiene permisos.

```typescript
throw new ForbiddenError();
// Resultado: "Acceso denegado"

throw new ForbiddenError("No tienes permisos para eliminar este recurso");
```

### `InternalServerError` (500)
Se usa para errores internos del servidor.

```typescript
throw new InternalServerError();
// Resultado: "Error interno del servidor"

throw new InternalServerError("Error al procesar la solicitud");
```

## Uso en Servicios

En los servicios, simplemente lanza el error apropiado:

```typescript
async updateClient(id: string, data: { name: string }): Promise<Client> {
    const existingClient = await this.clientRepository.getClientById(id);

    if (!existingClient) {
        throw new NotFoundError("Cliente", id);
    }

    return this.clientRepository.updateClient(id, {
        name: capitalize(data.name),
    });
}
```

## Uso en Handlers

Los handlers **NO** necesitan manejar errores manualmente. El middleware `errorHandler` los captura automáticamente:

```typescript
// ✅ CORRECTO - Simple y limpio
app.put<{ Params: { id: string }; Body: { name: string } }>("/clients/:id", async (req, reply) => {
    const parsedParams = updateClientParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
        return reply.status(400).send({
            error: "Validation error",
            issues: parsedParams.error.issues,
        });
    }

    const { id } = parsedParams.data;
    const parsedBody = updateClientBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
        return reply.status(400).send({
            error: "Validation error",
            issues: parsedBody.error.issues,
        });
    }

    // El error handler captura automáticamente los errores del servicio
    const updated = await service.updateClient(id, parsedBody.data);
    return reply.send(updated);
});

// ❌ INCORRECTO - No es necesario el try-catch
app.put("/clients/:id", async (req, reply) => {
    try {
        const updated = await service.updateClient(id, data);
        return reply.send(updated);
    } catch (err: any) {
        // ❌ No hagas esto, el middleware lo maneja
        if (err.message === "Cliente no existe") {
            return reply.status(404).send({ error: err.message });
        }
        throw err;
    }
});
```

## Formato de Respuesta de Error

Todos los errores se devuelven en el siguiente formato:

```json
{
  "error": "NOT_FOUND",
  "message": "Cliente con identificador 'abc123' no existe"
}
```

Para errores de validación de Zod:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Error de validación",
  "issues": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "El nombre es obligatorio",
      "path": ["name"]
    }
  ]
}
```

## Beneficios

1. **Consistencia**: Todos los errores siguen el mismo formato
2. **Mantenibilidad**: Cambiar mensajes de error es fácil
3. **Type Safety**: TypeScript ayuda a prevenir errores
4. **Código más limpio**: Los handlers son más simples
5. **Centralizado**: Un solo lugar para manejar errores
