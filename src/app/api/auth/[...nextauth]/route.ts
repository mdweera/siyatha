import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { compare } from "bcryptjs";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email or Phone", type: "text", placeholder: "admin@siyatha.lk or +9477xxxxxxx" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        await dbConnect();

        // Try to find user by email or phone
        const user = await User.findOne({
          $or: [
            { email: credentials.username },
            { phone: credentials.username }
          ]
        }).select('+password');

        if (!user) return null;
        if (!user.password) return null;

        const isMatch = await compare(credentials.password, user.password);

        if (!isMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.phone = user.phone;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.phone = token.phone as string;
        // @ts-ignore
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };