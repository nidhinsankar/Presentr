import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarLarge from "@/components/common/NavbarLarge";
import { ApolloProvider } from "@/lib/apollo-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/landing/Navbar";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import prisma from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Presentr",
  description: "Generate Slides with help of AI and modus",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getUser } = getKindeServerSession();
  const user = (await getUser()) as KindeUser;

  const userInDB = await prisma.user.findFirst({
    where: {
      id: user?.id,
    },
  });
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar user={user} />
        <ApolloProvider>{children}</ApolloProvider>
        <Toaster />
      </body>
    </html>
  );
}
