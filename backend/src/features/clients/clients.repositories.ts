import { Client } from '../../../generated/prisma';
import { prisma } from '../../shared/database/database';

export class ClientRepository {
    
    // Funciones Get

    async getAllClients(): Promise<Client[]> {
        return await prisma.client.findMany();
    }

    async getClientById(id: string): Promise<Client | null> {
        return await prisma.client.findUnique({
            where: { id }
        });
    }

    async getClientByName(name: string): Promise<Client | null> {
        return await prisma.client.findFirst({
            where: { name }
        });
    }


    // Funciones Post

    async createClient(data: { name: string }): Promise<Client> {
        return await prisma.client.create({
            data
        });
    }

    // Funciones Put
    
    async updateClient(id: string, data: { name: string }): Promise<Client> {
        return await prisma.client.update({
            where: { id },
            data
        });
    }

    // Funciones Delete
    
    async deleteClient(id: string): Promise<void> {
        await prisma.client.delete({
            where: { id }
        });
    }

}
