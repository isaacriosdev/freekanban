import { ClientRepository } from "./clients.repositories";
import { Client, Prisma } from "../../../generated/prisma";
import { capitalize } from "../../utils/string";
import { NotFoundError, ConflictError } from "../../shared/errors";

export class ClientService {
    constructor(private clientRepository: ClientRepository) { }

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
            throw new ConflictError("Cliente", "este nombre");
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
            throw new NotFoundError("Cliente", id);
        }

        return this.clientRepository.updateClient(id, {
            name: capitalize(data.name),
        });
    }

    // Eliminar cliente
    async deleteClient(id: string): Promise<void> {
        const existingClient = await this.clientRepository.getClientById(id);

        if (!existingClient) {
            throw new NotFoundError("Cliente", id);
        }

        await this.clientRepository.deleteClient(id);
    }
}
