# Auth Patterns — Karya Kata.

> Authentication and authorization using Auth.js v5 with Credentials provider. Role-based access control with SESSION and JWT strategies.

---

## 1. Auth Configuration

### Auth.js v5 Setup

**File:** `src/lib/auth.ts`

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/models/user";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // 1. Validate credentials
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Find user via Model
        const user = await findUserByEmail(email);
        if (!user || user.deletedAt) return null;

        // 3. Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // 4. Return user object (stored in JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // JWT callback: called when JWT is created/updated
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        // Initial sign in - add user data to token
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }

      // Handle session update (e.g., role change)
      if (trigger === "update" && session) {
        token.role = session.role;
        token.status = session.status;
      }

      return token;
    },
    // Session callback: called when session is checked
    session: async ({ session, token }) => {
      // Add token data to session (available in client)
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN" | "SUPER_ADMIN";
        session.user.status = token.status as
          | "PENDING"
          | "VERIFIED"
          | "REJECTED";
      }
      return session;
    },
  },
});
```

---

## 2. Type Extensions

### NextAuth Type Augmentation

**File:** `src/types/next-auth.d.ts`

```typescript
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN" | "SUPER_ADMIN";
      status: "PENDING" | "VERIFIED" | "REJECTED";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    status: "PENDING" | "VERIFIED" | "REJECTED";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    status?: "PENDING" | "VERIFIED" | "REJECTED";
  }
}
```

---

## 3. Route Handler

### API Route Setup

**File:** `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { GET, POST } from "@/lib/auth";

export { GET, POST };
```

---

## 4. Middleware for Route Protection

### Basic Middleware Pattern

**File:** `src/middleware.ts`

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const userStatus = req.auth?.user?.status;

  // Define route patterns
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/bookmarks") ||
    nextUrl.pathname.startsWith("/profile");

  // 1. Redirect authenticated users away from auth pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Check protected routes (require authentication)
  if (isProtectedRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // 3. Check admin routes (require ADMIN or SUPER_ADMIN)
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Check user status (must be VERIFIED)
    if (userStatus !== "VERIFIED") {
      return NextResponse.redirect(new URL("/pending-verification", nextUrl));
    }
  }

  return NextResponse.next();
});

// Match all routes except static files and API
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 5. Server-Side Auth Utilities

### Auth Helper Functions

**File:** `src/lib/auth-utils.ts`

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get current authenticated user (or null)
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Require authentication, redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Require ADMIN or SUPER_ADMIN role
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  if (user.status !== "VERIFIED") {
    redirect("/pending-verification");
  }

  return user;
}

/**
 * Check if user has specific role (no redirect)
 */
export async function hasRole(
  role: "USER" | "ADMIN" | "SUPER_ADMIN",
): Promise<boolean> {
  const user = await getCurrentUser();
  return (
    user?.role === role || (role === "ADMIN" && user?.role === "SUPER_ADMIN")
  );
}

/**
 * Check if user is authenticated (no redirect)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
```

---

## 6. Client-Side Auth

### Using useSession Hook

```tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <button disabled>Loading...</button>;
  }

  if (session) {
    return (
      <div>
        <span>{session.user.name}</span>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return <button onClick={() => signIn()}>Sign in</button>;
}
```

### Session Provider Setup

**File:** `src/components/session-provider.tsx`

```tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

**File:** `src/app/(main)/layout.tsx`

```tsx
import { AuthSessionProvider } from "@/components/session-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <main>{children}</main>
    </AuthSessionProvider>
  );
}
```

---

## 7. Server Actions with Auth

### Protected Server Action

```typescript
"use server";

import { requireAdmin } from "@/lib/auth-utils";
import { createArticle as createArticleModel } from "@/models/article";
import { revalidatePath } from "next/cache";

export async function createArticle(formData: FormData) {
  // 1. Auth check - throws/redirects if not admin
  const user = await requireAdmin();

  // 2. Validation
  const title = formData.get("title") as string;
  if (!title) {
    return { success: false, error: "Title required" };
  }

  // 3. Business logic
  const slug = slugify(title);

  // 4. Call Model with authenticated user
  const article = await createArticleModel({
    title,
    slug,
    authorId: user.id, // From auth session
    // ...
  });

  // 5. Side effects
  revalidatePath("/articles");

  return { success: true, articleId: article.id };
}
```

### Conditional Auth in Server Action

```typescript
"use server";

import { getCurrentUser } from "@/lib/auth-utils";
import { toggleReaction as toggleReactionModel } from "@/models/reaction";

export async function toggleReaction(
  articleId: string,
  type: "LIKE" | "DISLIKE",
) {
  // Allow anonymous viewing, require auth for reactions
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: "AUTH_REQUIRED",
      message: "Please sign in to react",
    };
  }

  await toggleReactionModel(articleId, user.id, type);

  return { success: true };
}
```

---

## 8. Role-Based UI

### Conditional Rendering by Role

```tsx
"use client";

import { useSession } from "next-auth/react";

export function AdminLink() {
  const { data: session } = useSession();

  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  if (!isAdmin) return null;

  return <a href="/admin">Admin Dashboard</a>;
}
```

### Server-Side Role Check for UI

```tsx
// Server Component
import { getCurrentUser } from "@/lib/auth-utils";

export default async function Header() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <header>
      <nav>{/* ... */}</nav>
      {isAdmin && <a href="/admin">Admin</a>}
      {user ? <UserMenu user={user} /> : <LoginLink />}
    </header>
  );
}
```

---

## 9. User Status Flow

### Status-Based Access

```typescript
// Registration sets status to PENDING
export async function registerUser(data: RegisterInput) {
  const user = await createUser({
    ...data,
    status: "PENDING", // New users need verification
    role: "USER",
  });

  // Send verification email...

  return { success: true, userId: user.id };
}

// Admin verifies user
export async function verifyUser(userId: string) {
  const admin = await requireAdmin();

  await updateUser(userId, {
    status: "VERIFIED",
    verifiedBy: admin.id,
    verifiedAt: new Date(),
  });

  // Update session if user is logged in
  // (handled via session update callback)

  return { success: true };
}
```

---

## 10. Password Handling

### Hashing

```typescript
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

### Password Change Flow

```typescript
"use server";

import { requireAuth } from "@/lib/auth-utils";
import { hashPassword, verifyPassword } from "@/lib/password";
import { updateUser } from "@/models/user";
import { findUserById } from "@/models/user";

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const user = await requireAuth();

  // Verify current password
  const fullUser = await findUserById(user.id);
  const isValid = await verifyPassword(currentPassword, fullUser.password);

  if (!isValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Hash and update
  const hashedNewPassword = await hashPassword(newPassword);
  await updateUser(user.id, { password: hashedNewPassword });

  return { success: true };
}
```

---

## Summary: Auth Patterns

| Pattern               | Implementation                                 |
| --------------------- | ---------------------------------------------- |
| **Auth Config**       | `src/lib/auth.ts` with Credentials provider    |
| **Types**             | Extend `next-auth` module declarations         |
| **Route Protection**  | `src/middleware.ts` for path-based guards      |
| **Server Auth**       | `requireAuth()`, `requireAdmin()` helpers      |
| **Client Auth**       | `useSession()` hook from `next-auth/react`     |
| **Protected Actions** | Call `requireAuth()` at start of Server Action |
| **Role Check**        | `user.role === 'ADMIN'` or `hasRole()` helper  |
| **Status Check**      | Include in middleware and Server Actions       |
| **Password**          | bcrypt with 12 salt rounds                     |
| **JWT Strategy**      | Store id, role, status in token                |

---

## Security Checklist

- [ ] `AUTH_SECRET` is set in environment
- [ ] Session maxAge is configured (30 days max)
- [ ] Middleware protects all `/admin/*` routes
- [ ] Server Actions validate auth before operations
- [ ] Passwords hashed with bcrypt (min 10 rounds)
- [ ] `authorize()` returns minimal user data (no password hash)
- [ ] JWT callback only adds necessary fields (id, role, status)
- [ ] Role changes trigger session update (or require re-login)
- [ ] Deleted users cannot authenticate (check `deletedAt`)
- [ ] CSRF protection enabled (Auth.js default)
