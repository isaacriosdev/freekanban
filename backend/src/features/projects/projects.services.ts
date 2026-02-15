import { ProjectRepository } from "./projects.repositories";
import { ClientRepository } from "../clients/clients.repositories";
import { Project, Prisma } from "../../../generated/prisma";
import { capitalize } from "../../utils/string";

export class ProjectService {
    constructor(
        private clientRepository: ClientRepository,
        private projectRepository: ProjectRepository
    ) {}

    // Funciones de obtencion

   async getAllProjects(): Promise<Project[]> {
       return this.projectRepository.getAllProjects();
   }

   async getProjectsByClient( clientId: string ): Promise<Project[]> {
       const existingClient = await this.clientRepository.getClientById(clientId);

       if (!existingClient) {
           throw new Error("Cliente no existe")
       }

       return this.projectRepository.getProjectsByClient(
           clientId
       );
   }

   // Funciones de creacion
   
    async createProject(data: Prisma.ProjectUncheckedCreateInput): Promise<Project> {
        const normalizedName = capitalize(data.name);

        const duplicate = await this.projectRepository.getProjectByClient(data.clientId, normalizedName);

        if (duplicate) {
            throw new Error("Proyecto ya existe en este cliente");
        }


        return this.projectRepository.createProject({
            ...data,
            name: normalizedName,
        });
    }


   // funciones de actualizacion

   async updateProject( clientId: string, id: string, data: { name: string }): Promise<Project>{
       const normalizedName = capitalize(data.name);
       const existingProject = await this.projectRepository.getProjectById(id);

       if (!existingProject) {
           throw new Error('Proyecto no existe')
       }
        
       const duplicate = await this.projectRepository.getProjectByClient(clientId, normalizedName);


       if (duplicate && duplicate.id !== id) {
           throw new Error('El projecto ya existe en este cliente')
       }

       return this.projectRepository.updateProject(id, {
           name: normalizedName,
       });
   }

   // funciones de eliminacion
   
   async deleteProject( id: string ): Promise<void> {
       const existingProject = await this.projectRepository.getProjectById(id);

       if (!existingProject) {
           throw new Error('Projecto no existe')
       }

       await this.projectRepository.deleteProject(id);

   }

}



