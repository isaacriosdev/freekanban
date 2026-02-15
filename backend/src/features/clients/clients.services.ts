import { ClientRepository } from "./clients.repositories";
import { Client, Prisma } from "../../../generated/prisma";
import { capitalize } from "../../utils/string";

export class ClientService {
    constructor(private clientRepository: ClientRepository) {}

    // Obtener todos los clientes
    async getAllClients(): Promise<Client[]> {
        return this.clientRepository.getAllClients();
    }

    // Crear cliente (asume input validado en handler)
    async createClient(clientData: Prisma.ClientCreateInput): Promise<Client> {
        const normalizedName = capitalize(clientData.name);

        const existingClient =
        await this.clientRepository.getClientByName(normalizedName);

        if (existingClient) {
        throw new Error("Cliente ya existe");
        }

        return this.clientRepository.createClient({
            ...clientData,
            name: normalizedName,
        });
    }

    // Actualizar cliente (asume input validado en handler)
    async updateClient(id: string, data: { name: string }): Promise<Client> {
        const existingClient = await this.clientRepository.getClientById(id);

        if (!existingClient) {
            throw new Error("Cliente no existe");
        }

        return this.clientRepository.updateClient(id, {
            name: capitalize(data.name),
        });
    }

    // Eliminar cliente
    async deleteClient(id: string): Promise<void> {
        const existingClient = await this.clientRepository.getClientById(id);

        if (!existingClient) {
            throw new Error("El cliente no existe.");
        }

        await this.clientRepository.deleteClient(id);
    }
}
