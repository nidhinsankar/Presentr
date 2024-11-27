import CleanTranscript from "@/components/graphql/clean-transcript";
import ConvertTextToArray from "@/components/graphql/convert-text-array";
import ImproveContent from "@/components/graphql/improve-content";
import RunTheProcess from "@/components/graphql/run-the-process";
import TitleAndDescription from "@/components/graphql/title-and-description";
import PresentationCreator from "@/components/presentation-creation";
import { GetCleanedTranscript } from "@/lib/presentation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { redirect } from "next/navigation";

export default async function ModusgraphqlPage() {
  const { getUser } = getKindeServerSession();
  const user: KindeUser | null = await getUser();

  if (!user) {
    redirect("/");
  }
  return (
    <div className="max-w-5xl mx-auto">
      <RunTheProcess user={user} />
      {/* <PresentationCreator />÷ */}
      {/* <CleanTranscript /> */}
      {/* <ConvertTextToArray /> */}
      {/* <TitleAndDescription /> */}
      {/* <ImproveContent /> */}
    </div>
  );
}
