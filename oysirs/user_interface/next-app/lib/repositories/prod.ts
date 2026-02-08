import { OysirsRepository } from "./base";

export class OysirsRepositoryProd extends OysirsRepository {
    public async getUploadList() {
        const res = await this.client.fetch("uploads");
        if (!res.ok) {
            throw new Error(`Failed to fetch upload list: ${res.statusText}`);
        }
        return res.json();
    }

    public async getCustomerData(customerId: string, year: string, bank: string) {
        const res = await this.client.fetch(`customers/${customerId}?year=${year}&bank=${bank}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch customer data: ${res.statusText}`);
        }
        return res.json();
    }

    public async createUploadUrl(year: string, bank: string) {
        const res = await this.client.fetch(`uploads/ingest`, {
            method: "POST",
            body: JSON.stringify({
                year,
                bank,
            }),
        });
        if (!res.ok) {
            throw new Error(`Failed to create upload URL: ${res.statusText}`);
        }
        return res.json();
    }

    public async uploadFile(file: File, uploadUrl: string) {
        const res = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
        });
        if (!res.ok) {
            throw new Error(`Failed to upload file: ${res.statusText}`);
        }
    }

    public async getCustomerList(searchField: string, searchValue: string, offset: number, limit: number) {
        const res = await this.client.fetch(`customers?${searchField}=${searchValue}&offset=${offset}&limit=${limit}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch customer list: ${res.statusText}`);
        }
        return res.json();
    }
}
