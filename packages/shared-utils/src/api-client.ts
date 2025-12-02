export interface ApiClientOptions {
    baseUrl: string;
    getAuthToken?: () => string | null;
    storeSlug?: string;
}

export class ApiClient {
    private baseUrl: string;
    private getAuthToken?: () => string | null;
    private storeSlug?: string;

    constructor(options: ApiClientOptions) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
        this.getAuthToken = options.getAuthToken;
        this.storeSlug = options.storeSlug;
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const headers = new Headers(options.headers);

        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        if (this.getAuthToken) {
            const token = this.getAuthToken();
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        }

        // Pass store slug if available, though usually this is handled by URL path or domain
        // But for admin API calls that might need to target a specific store context
        if (this.storeSlug) {
            headers.set('x-store-slug', this.storeSlug);
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    get<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'GET' });
    }

    post<T>(path: string, body: any): Promise<T> {
        return this.request<T>(path, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    put<T>(path: string, body: any): Promise<T> {
        return this.request<T>(path, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    delete<T>(path: string): Promise<T> {
        return this.request<T>(path, { method: 'DELETE' });
    }
}
