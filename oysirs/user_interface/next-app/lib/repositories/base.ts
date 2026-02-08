import { Client } from "../client";
import { CustomerListProps, CustomerWithTrxnSummaryProps } from "../types/customers";
import { UploadListProps, UploadUrlProps } from "../types/uploads";

export abstract class OysirsRepository {
    client: Client;
    constructor(accessTokenProvider: () => string) {
        this.client = new Client();
        this.client.setAccessTokenProvider(accessTokenProvider);
    }

    /**
     * Get upload list
     */
    public abstract getUploadList(): Promise<UploadListProps>;

    /**
     * Get customer data
     */
    public abstract getCustomerData(customerId: string, year: string, bank: string): Promise<CustomerWithTrxnSummaryProps>;

    /**
     * Create upload url
     */
    public abstract createUploadUrl(year: string, bank: string): Promise<UploadUrlProps>;

    /**
     * Upload file
     */
    public abstract uploadFile(file: File, uploadUrl: string): Promise<void>;

    /**
     * get customer list
     */
    public abstract getCustomerList(searchField: string, searchValue: string, offset: number, limit: number): Promise<CustomerListProps>;
}
