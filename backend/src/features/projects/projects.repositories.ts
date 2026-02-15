import { Project } from "../../../generated/prisma";
import { prisma } from "../../shared/database/database";
import { Prisma } from "../../../generated/prisma";

export class ProjectRepository {
    // Funciones GET

    async getAllProjects(): Promise<Project[]> {
        return prisma.project.findMany(); 
    }

    async getProjectById(id: string): Promise<Project | null> {
        return prisma.project.findUnique({
            where: { id }
        });
    }

    async getProjectByName(name: string): Promise<Project | null> {
        return prisma.project.findFirst({
            where: { name }
        });
    }

    async getProjectsByClient(clientId: string): Promise<Project[]>{
        return prisma.project.findMany({
            where: { clientId }
        });
    }

    async getProjectByClient(clientId: string, name: string): Promise<Project | null>{
        return prisma.project.findFirst({
            where: { name, clientId }
        });
    }

    // Funciones POST

    async createProject(data: Prisma.ProjectUncheckedCreateInput): Promise<Project>{
        return prisma.project.create({
            data
        })
    }

    // Funciones PUT
   
    async updateProject(id: string, data: { name: string }): Promise<Project> {
        return prisma.project.update({
            where: { id },
            data
        })
    }


    // Funciones DELETE
    
    async deleteProject(id: string): Promise<void> {
        await prisma.project.delete({
            where: { id }
        })
    }

}
