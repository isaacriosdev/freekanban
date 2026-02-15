import { TagRepository } from "./tags.repositories";
import { Tag, Prisma } from "../../../generated/prisma";
import { NotFoundError, ConflictError } from "../../shared/errors";
import { capitalize } from "../../utils/string";

export class TagService {
    constructor(private tagRepository: TagRepository) { }

    // Obtener todas las etiquetas
    async getAllTags(): Promise<Tag[]> {
        return this.tagRepository.getAllTags();
    }

    // Obtener etiqueta por ID
    async getTagById(id: string): Promise<Tag> {
        const tag = await this.tagRepository.getTagById(id);

        if (!tag) {
            throw new NotFoundError("Etiqueta", id);
        }

        return tag;
    }

    // Crear etiqueta
    async createTag(data: Prisma.TagCreateInput): Promise<Tag> {
        const normalizedName = capitalize(data.name);

        // Verificar si ya existe una etiqueta con ese nombre
        const existingTag = await this.tagRepository.getTagByName(normalizedName);

        if (existingTag) {
            throw new ConflictError("Etiqueta", "este nombre");
        }

        return this.tagRepository.createTag({
            ...data,
            name: normalizedName,
        });
    }

    // Actualizar etiqueta
    async updateTag(id: string, data: { name?: string; color?: string }): Promise<Tag> {
        const existingTag = await this.tagRepository.getTagById(id);

        if (!existingTag) {
            throw new NotFoundError("Etiqueta", id);
        }

        // Si se actualiza el nombre, verificar que no exista otra etiqueta con ese nombre
        if (data.name) {
            const normalizedName = capitalize(data.name);
            const duplicateTag = await this.tagRepository.getTagByName(normalizedName);

            if (duplicateTag && duplicateTag.id !== id) {
                throw new ConflictError("Etiqueta", "este nombre");
            }

            return this.tagRepository.updateTag(id, {
                name: normalizedName,
                color: data.color,
            });
        }

        return this.tagRepository.updateTag(id, data);
    }

    // Eliminar etiqueta
    async deleteTag(id: string): Promise<void> {
        const existingTag = await this.tagRepository.getTagById(id);

        if (!existingTag) {
            throw new NotFoundError("Etiqueta", id);
        }

        await this.tagRepository.deleteTag(id);
    }

    // Obtener etiquetas de una tarea
    async getTagsByTask(taskId: string): Promise<Tag[]> {
        return this.tagRepository.getTagsByTask(taskId);
    }

    // Asignar etiqueta a tarea
    async assignTagToTask(taskId: string, tagId: string): Promise<void> {
        // Verificar que la etiqueta existe
        const tag = await this.tagRepository.getTagById(tagId);

        if (!tag) {
            throw new NotFoundError("Etiqueta", tagId);
        }

        await this.tagRepository.assignTagToTask(taskId, tagId);
    }

    // Remover etiqueta de tarea
    async removeTagFromTask(taskId: string, tagId: string): Promise<void> {
        // Verificar que la etiqueta existe
        const tag = await this.tagRepository.getTagById(tagId);

        if (!tag) {
            throw new NotFoundError("Etiqueta", tagId);
        }

        await this.tagRepository.removeTagFromTask(taskId, tagId);
    }
}
