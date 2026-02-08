export class Client {
    baseUrl: string;
    private accessToken: string | undefined;
    private getAccessToken: (() => string) | undefined;
    private maxRetries: number = 3;
    private retryCount: number = 0;

    constructor(baseUrl: string = process.env.NEXT_PUBLIC_BASE_API_URL ?? "") {
        this.baseUrl = baseUrl;
    }

    public async fetch(endpoint: string, init?: RequestInit | undefined): Promise<Response> {
        let headers: HeadersInit = {};
        if (this.accessToken) {
            headers["Authorization"] = `Bearer ${this.accessToken}`;
        }
        headers = { ...headers, ...init?.headers };
        const res = await fetch(`${this.baseUrl}/${endpoint}`, { ...init, headers });
        // Refetch if access token is expired
        if (res.status === 401) {
            this.accessToken = this.getAccessToken?.();
            this.retryCount++;
            if (this.retryCount < this.maxRetries) {
                return this.fetch(endpoint, init);
            }
        }
        return res;
    }
    /**
     * Set the access token provider
     */
    public setAccessTokenProvider(provider: () => string) {
        this.getAccessToken = provider;
    }
}