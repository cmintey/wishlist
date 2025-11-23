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

    archive = async () => {
        return await this._makeRequest("PATCH", { archived: true });
    };

    unarchive = async () => {
        return await this._makeRequest("PATCH", { archived: false });
    };
}

export class ItemsAPI {
    _makeRequest = async (method: string, path: string, body?: any) => {
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

    clearItemsFromLists = async (groupId?: string, claimed?: boolean) => {
        const searchParams = new URLSearchParams();
        if (groupId) searchParams.append("groupId", groupId);
        if (claimed) searchParams.append("claimed", `${claimed}`);
        return await this._makeRequest("DELETE", "?" + searchParams.toString());
    };

    updateMany = async (items: (Record<string, unknown> & { id: number })[]) => {
        return await this._makeRequest("PATCH", "", items);
    };
}
