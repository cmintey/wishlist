import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import { client } from "./prisma";

const adapter = new PrismaAdapter(client.session, client.user);

export const auth = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: !dev,
            path: "/"
        }
    },
    getUserAttributes: (data) => {
        return {
            username: data.username,
            email: data.email,
            name: data.name,
            roleId: data.roleId,
            picture: data.picture
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof auth;
        DatabaseSessionAttributes: DatabaseSessionAttributes;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseSessionAttributes {}
interface DatabaseUserAttributes {
    username: string;
    name: string;
    email: string;
    roleId: number;
    picture?: string | null;
}
