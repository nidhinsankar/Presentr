import LandingLayout from "@/components/landing/LandingLayout";
import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = (await getUser()) as KindeUser;

  const userInDB = await prisma.user.findFirst({
    where: {
      id: user?.id,
    },
  });
  return (
    <main>
      <LandingLayout user={user} />
    </main>
  );
}
