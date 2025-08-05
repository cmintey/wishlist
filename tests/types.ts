export interface UserData {
    id: string;
    name: string;
    username: string;
    email: string;
    password: string;
    groups: GroupData[];
}

export interface GroupData {
    id: string;
    name: string;
}
