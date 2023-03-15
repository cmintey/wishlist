import type { Group, UserGroupMembership } from "@prisma/client";

export class GroupAPI {
	groupId: string;
	constructor(groupId: string) {
		this.groupId = groupId;
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

		return await fetch(`/api/groups/${this.groupId}${path}`, options);
	};

	addMember = async (userId: string, manager = false): Promise<UserGroupMembership> => {
		return await this._makeRequest("PUT", `/users/${userId}`, { manager }).then((resp) =>
			resp.json()
		);
	};

	removeMember = async (userId: string): Promise<UserGroupMembership> => {
		return await this._makeRequest("DELETE", `/users/${userId}`).then((resp) => resp.json());
	};

	makeManager = async (userId: string): Promise<UserGroupMembership> => {
		return await this._makeRequest("PATCH", `/users/${userId}`, { manager: true }).then((resp) =>
			resp.json()
		);
	};

	removeManager = async (userId: string): Promise<UserGroupMembership> => {
		return await this._makeRequest("PATCH", `/users/${userId}`, { manager: false }).then((resp) =>
			resp.json()
		);
	};
}

export class GroupsAPI {
	_makeRequest = async (method: string, body?: Record<string, unknown>) => {
		const options: RequestInit = {
			method,
			headers: {
				"content-type": "application/json",
				accept: "application/json"
			}
		};

		if (body) options.body = JSON.stringify(body);

		return await fetch(`/api/groups`, options);
	};

	create = async (name: string): Promise<Group> => {
		return await this._makeRequest("PUT", { name })
			.then((resp) => resp.json())
			.then(({ group }) => group);
	};
}
