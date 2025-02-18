export class ClaimAPI {
    private claimId: string;
    constructor(claimId: string) {
        this.claimId = claimId;
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

        const url = `/api/claims/${this.claimId}`;
        return await fetch(url, options);
    };

    purchase = async () => {
        return await this._makeRequest("PATCH", { purchased: true });
    };

    unpurchase = async () => {
        return await this._makeRequest("PATCH", { purchased: false });
    };

    unclaim = async () => {
        return await this._makeRequest("DELETE");
    };
}
