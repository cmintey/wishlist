export class PublicListAPI {
    groupId: string;
    constructor(groupId: string) {
        this.groupId = groupId;
    }

    _makeRequest = async (method: string) => {
        const options: RequestInit = {
            method,
            headers: {
                "content-type": "application/json",
                accept: "application/json"
            }
        };

        let url = "/api/lists";
        if (method !== "GET") {
            options.body = JSON.stringify({
                groupId: this.groupId
            });
        } else {
            url += `?groupId=${this.groupId}`;
        }

        return await fetch(url, options);
    };

    get = async () => {
        return await this._makeRequest("GET");
    };

    create = async () => {
        return await this._makeRequest("POST");
    };
}
