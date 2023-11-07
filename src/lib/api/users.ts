import type { Group, UserGroupMembership } from "@prisma/client";
import type { GroupInformation } from "../../ambient";

export class UserAPI {
	userId: string;
	constructor(userId: string) {
		this.userId = userId;
	}

	_makeRequest = async (method: string, path = "", body?: Record<string, unknown>) => {
		const options: RequestInit = {
			method,
			headers: {
				"content-type": "application/json",
				accept: "application/json"
			}
		};

		if (body) options.body = JSON.stringify(body);

		return await fetch(`/api/users/${this.userId}${path}`, options);
	};

	groups = async (): Promise<GroupInformation[]> => {
		return await this._makeRequest("GET", "/groups")
			.then((resp) => resp.json())
			.then(({ groups }) => groups);
	};

	activeGroup = async (): Promise<Group> => {
		return await this._makeRequest("GET", "/groups?active=true")
			.then((resp) => resp.json())
			.then(({ groups }) => groups[0]);
	};

	setActiveGroup = async (groupId: string): Promise<UserGroupMembership> => {
		return await this._makeRequest("PATCH", `/groups/${groupId}`, { active: true })
			.then((resp) => resp.json())
			.then(({ membership }) => membership);
	};
}

export class UsersAPI {
	_makeRequest = async (method: string, query = "") => {
		const options: RequestInit = {
			method,
			headers: {
				accept: "application/json"
			}
		};

		return await fetch(`/api/users${query}`, options);
	};

	all = async () => {
		return await this._makeRequest("GET");
	};

	search = async (search: string) => {
		return await this._makeRequest("GET", `?name=${search}`);
	};
}
