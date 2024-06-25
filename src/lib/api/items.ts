export class ItemAPI {
    itemId: number;
    constructor(itemId: number) {
        this.itemId = itemId;
    }

    _makeRequest = async (method: string, body?: Record<string, unknown>) => {
        const options: RequestInit = {
            method,
            headers: {
                "content-type": "application/json",
                accept: "application/json"
            }
        };

        if (body) options.body = JSON.stringify(body);

        return await fetch(`/api/items/${this.itemId}`, options);
    };

    delete = async () => {
        return await this._makeRequest("DELETE");
    };

    approve = async () => {
        return await this._makeRequest("PATCH", { approved: true });
    };

    deny = async () => {
        return await this.delete();
    };

    claim = async (userId: string) => {
        return await this._makeRequest("PATCH", { pledgedById: userId });
    };

    unclaim = async () => {
        return await this._makeRequest("PATCH", { pledgedById: "0" });
    };

    publicClaim = async (systemUserId: string) => {
        return await this._makeRequest("PATCH", { publicPledgedById: systemUserId });
    };

    purchase = async () => {
        return await this._makeRequest("PATCH", { purchased: true });
    };

    unpurchase = async () => {
        return await this._makeRequest("PATCH", { purchased: false });
    };
}

export class ItemsAPI {
    _makeRequest = async (method: string, path: string, body?: Record<string, unknown>) => {
        const options: RequestInit = {
            method,
            headers: {
                "content-type": "application/json",
                accept: "application/json"
            }
        };

        if (body) options.body = JSON.stringify(body);

        return await fetch(`/api/items${path}`, options);
    };

    delete = async (groupId?: string, claimed?: boolean) => {
        const searchParams = new URLSearchParams();
        if (groupId) searchParams.append("groupId", groupId);
        if (claimed) searchParams.append("claimed", `${claimed}`);
        return await this._makeRequest("DELETE", "?" + searchParams.toString());
    };
}
