/**
 * EasyPost Shipping Service
 * Uses fetch API for Worker compatibility (no npm package required)
 * Each merchant provides their own EasyPost API key
 */

const EASYPOST_API_BASE = 'https://api.easypost.com/v2';

export interface EasyPostAddress {
    id?: string;
    name?: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
}

export interface EasyPostParcel {
    id?: string;
    length: number;
    width: number;
    height: number;
    weight: number; // in ounces
}

export interface EasyPostRate {
    id: string;
    carrier: string;
    service: string;
    rate: string;
    currency: string;
    delivery_days?: number;
    delivery_date?: string;
}

export interface EasyPostShipment {
    id: string;
    rates: EasyPostRate[];
    selected_rate?: EasyPostRate;
    postage_label?: {
        label_url: string;
    };
    tracking_code?: string;
    tracker?: {
        id: string;
        public_url: string;
        status: string;
    };
}

export class EasyPostService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private getAuthHeader(): string {
        return 'Basic ' + btoa(this.apiKey + ':');
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${EASYPOST_API_BASE}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
                (error as { error?: { message?: string } }).error?.message ||
                `EasyPost API error: ${response.status}`
            );
        }

        return response.json() as Promise<T>;
    }

    /**
     * Create an EasyPost address object
     */
    async createAddress(address: EasyPostAddress): Promise<EasyPostAddress> {
        return this.request<EasyPostAddress>('/addresses', {
            method: 'POST',
            body: JSON.stringify({ address }),
        });
    }

    /**
     * Create a parcel object
     * Default: 1lb package (16oz), 6x6x6 inches
     */
    async createParcel(parcel?: Partial<EasyPostParcel>): Promise<EasyPostParcel> {
        const defaultParcel: EasyPostParcel = {
            length: 6,
            width: 6,
            height: 6,
            weight: 16, // 1 pound in ounces
        };

        return this.request<EasyPostParcel>('/parcels', {
            method: 'POST',
            body: JSON.stringify({ parcel: { ...defaultParcel, ...parcel } }),
        });
    }

    /**
     * Get shipping rates for a shipment
     */
    async getShippingRates(
        fromAddress: EasyPostAddress,
        toAddress: EasyPostAddress,
        parcel?: Partial<EasyPostParcel>
    ): Promise<EasyPostShipment> {
        // Create a shipment which automatically returns rates
        const shipment = await this.request<EasyPostShipment>('/shipments', {
            method: 'POST',
            body: JSON.stringify({
                shipment: {
                    from_address: fromAddress,
                    to_address: toAddress,
                    parcel: parcel || {
                        length: 6,
                        width: 6,
                        height: 6,
                        weight: 16,
                    },
                },
            }),
        });

        return shipment;
    }

    /**
     * Purchase a shipping label for a rate
     */
    async buyLabel(shipmentId: string, rateId: string): Promise<EasyPostShipment> {
        return this.request<EasyPostShipment>(`/shipments/${shipmentId}/buy`, {
            method: 'POST',
            body: JSON.stringify({
                rate: { id: rateId },
            }),
        });
    }

    /**
     * Get tracking information
     */
    async getTracking(trackingCode: string, carrier: string): Promise<{
        id: string;
        status: string;
        public_url: string;
        tracking_details: Array<{
            datetime: string;
            message: string;
            status: string;
        }>;
    }> {
        return this.request('/trackers', {
            method: 'POST',
            body: JSON.stringify({
                tracker: {
                    tracking_code: trackingCode,
                    carrier,
                },
            }),
        });
    }

    /**
     * Retrieve an existing shipment
     */
    async getShipment(shipmentId: string): Promise<EasyPostShipment> {
        return this.request<EasyPostShipment>(`/shipments/${shipmentId}`);
    }
}
