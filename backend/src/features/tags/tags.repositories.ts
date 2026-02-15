import { prisma } from "../../shared/database/database";
import { Tag, Prisma } from "../../../generated/prisma";

export class TagRepository {
    // Obtener todas las etiquetas
    async getAllTags(): Promise<Tag[]> {
        return prisma.tag.findMany({
            orderBy: { name: "asc" },
        });
    }

    // Obtener etiqueta por ID
    async getTagById(id: string): Promise<Tag | null> {
        return prisma.tag.findUnique({
            where: { id },
        });
    }

    // Obtener etiqueta por nombre
    async getTagByName(name: string): Promise<Tag | null> {
        return prisma.tag.findUnique({
            where: { name },
        });
    }

    // Crear etiqueta
    async createTag(data: Prisma.TagCreateInput): Promise<Tag> {
        return prisma.tag.create({
            data,
        });
    }

    // Actualizar etiqueta
    async updateTag(id: string, data: Prisma.TagUpdateInput): Promise<Tag> {
        return prisma.tag.update({
            where: { id },
            data,
        });
    }

    // Eliminar etiqueta
    async deleteTag(id: string): Promise<void> {
        await prisma.tag.delete({
            where: { id },
        });
    }

    // Obtener etiquetas de una tarea
    async getTagsByTask(taskId: string): Promise<Tag[]> {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { tags: true },
        });
        return task?.tags || [];
    }

    // Asignar etiqueta a tarea
    async assignTagToTask(taskId: string, tagId: string): Promise<void> {
        await prisma.task.update({
            where: { id: taskId },
            data: {
                tags: {
                    connect: { id: tagId },
                },
            },
        });
    }

    // Remover etiqueta de tarea
    async removeTagFromTask(taskId: string, tagId: string): Promise<void> {
        await prisma.task.update({
            where: { id: taskId },
            data: {
                tags: {
                    disconnect: { id: tagId },
                },
            },
        });
    }
}
