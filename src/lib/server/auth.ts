import { Lucia, TimeSpan } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import { client } from "./prisma";
import { env } from "$env/dynamic/private";

const adapter = new PrismaAdapter(client.session, client.user);

const origin = new URL(env.ORIGIN || "localhost:3280");
export const auth = new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(2, "w"),
    sessionCookie: {
        attributes: {
            secure: !dev && origin.protocol === "https:",
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DatabaseSessionAttributes {}
interface DatabaseUserAttributes {
    username: string;
    name: string;
    email: string;
    roleId: number;
    picture?: string | null;
}
