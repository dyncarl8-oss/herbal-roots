import Whop from '@whop/sdk';

let whopClient: Whop | null = null;

export function getWhopClient(): Whop {
    if (!whopClient) {
        const apiKey = process.env.WHOP_API_KEY;
        if (!apiKey) {
            throw new Error('WHOP_API_KEY environment variable is not set');
        }

        whopClient = new Whop({ apiKey });
        console.log('[Whop] SDK initialized');
    }
    return whopClient;
}

export function getWhopAppId(): string {
    const appId = process.env.WHOP_APP_ID || process.env.NEXT_PUBLIC_WHOP_APP_ID;
    if (!appId) {
        throw new Error('WHOP_APP_ID environment variable is not set');
    }
    return appId;
}

// Optional: Company ID for access checks
export function getWhopCompanyId(): string | undefined {
    return process.env.WHOP_COMPANY_ID;
}
