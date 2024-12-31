export class ListAPI {
    listId: string;
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
