import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

async function userFromGoogle(email: string, name: string) {
  await dbConnect();
  const existing = await User.findOne({ email });
  if (existing) {
    return existing;
  }

  return User.create({
    name: name || "Siyatha customer",
    email,
    role: "USER",
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        if (!username || !credentials?.password) {
          return null;
        }

        await dbConnect();
        const user = await User.findOne({
          $or: [{ email: username }, { phone: username }],
        }).select("+password");

        if (!user?.password) {
          return null;
        }

        const isMatch = await compare(credentials.password, user.password);
        if (!isMatch) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const email = String(token.email || user?.email || "");
        if (!email) {
          return token;
        }
        const record = await userFromGoogle(email, String(user?.name || token.name || ""));
        token.sub = record._id.toString();
        token.id = record._id.toString();
        token.role = record.role;
        token.phone = record.phone || "";
        token.email = record.email;
        return token;
      }

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub || "");
        session.user.role = String(token.role || "USER");
        session.user.phone = String(token.phone || "");
        if (token.email) {
          session.user.email = String(token.email);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
