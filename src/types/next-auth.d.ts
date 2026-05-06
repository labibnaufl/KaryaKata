import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN" | "SUPER_ADMIN";
      status: "PENDING" | "VERIFIED" | "REJECTED";
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    status: "PENDING" | "VERIFIED" | "REJECTED";
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    status?: "PENDING" | "VERIFIED" | "REJECTED";
  }
}
