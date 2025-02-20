export class ListAPI {
    private listId: string;
    constructor(listId: string) {
        this.listId = listId;
    }

    _makeRequest = async (method: string, data?: Record<string, any>) => {
        const options: RequestInit = {
            method,
            headers: {
                "content-type": "application/json",
                accept: "application/json"
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const url = `/api/lists/${this.listId}`;
        return await fetch(url, options);
    };

    makePublic = async () => {
        return await this._makeRequest("PATCH", { public: true });
    };
}

export class ListItemAPI {
    private listId: string;
    private itemId: number;

    constructor(listId: string, itemId: number) {
        this.listId = listId;
        this.itemId = itemId;
    }

    _makeRequest = async (method: string, path: string = "/", data?: Record<string, any>) => {
        const options: RequestInit = {
            method,
            headers: {
                "content-type": "application/json",
                accept: "application/json"
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const url = `/api/lists/${this.listId}/items/${this.itemId}${path}`;
        return await fetch(url, options);
    };

    delete = async () => {
        return await this._makeRequest("DELETE");
    };

    approve = async () => {
        return await this._makeRequest("PATCH", "/", { approved: true });
    };

    deny = async () => {
        return await this._makeRequest("DELETE");
    };

    claim = async (claimedById: string) => {
        return await this._makeRequest("PUT", "/claims", { claimedById });
    };

    claimPublic = async (publicClaimedById: string) => {
        return await this._makeRequest("PUT", "/claims", { publicClaimedById });
    };
}
