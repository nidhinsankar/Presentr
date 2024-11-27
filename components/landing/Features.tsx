import FeatureCard from "@/components/ui/FeatureCard";
import Tag from "@/components/ui/Tag";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import Key from "@/components/ui/Key";

const features = [
  "Multi-Language Support",
  "Collaboration",
  "Speech to text",
  "Smart Sync",
  "Custom Styling",
  "Smooth Transitions",
  "Custom Editor",
];

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="container">
        <div className="flex justify-center">
          <Tag>Features</Tag>
        </div>
        <h2 className="text-6xl font-medium text-center mt-6 max-w-2xl mx-auto">
          Where power meets <span className="text-[#2463eb]">simplicity</span>
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Smart Slide Summaries"
            description="Presentr AI extracts key points and organizes them into clear, concise slides."
            className="md:col-span-2 lg:col-span-1 group"
          >
            <div className="aspect-video flex items-center justify-center">
              <Avatar className="z-40">
                <Image src={""} alt="Avatar 1" className="rounded-full" />
              </Avatar>
              <Avatar className="-ml-6 border-indigo-500 z-30">
                <Image src={""} alt="Avatar 2" className="rounded-full" />
              </Avatar>
              <Avatar className="-ml-6 border-amber-500 z-20">
                <Image src={""} alt="Avatar 3" className="rounded-full" />
              </Avatar>
              <Avatar className="-ml-6 z-10 border-transparent group-hover:border-green-500 transition">
                <div className="relative size-full bg-neutral-700 rounded-full inline-flex items-center justify-center gap-1">
                  <Image
                    src={""}
                    alt="Avatar 4"
                    className="absolute size-full rounded-full opacity-0 group-hover:opacity-100 transition duration-500"
                  />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span
                      key={i}
                      className="size-1.5 bg-white rounded-full inline-flex"
                    ></span>
                  ))}
                </div>
              </Avatar>
            </div>
          </FeatureCard>
          <FeatureCard
            title="Instant Slide Generation"
            description="Engage your clients with prototypes that react to user actions"
            className="md:col-span-2 lg:col-span-1 group"
          >
            <div className="relative flex items-center justify-center aspect-video">
              <p className="text-4xl text-center font-extrabold text-neutral-800 group-hover:text-white/10 transition duration-500">
                Before you{" "}
                <span className="relative bg-gradient-to-tr from-blue-400 to-blue-400 bg-clip-text text-transparent">
                  <span>blink</span>
                  <video
                    src="/assets/gif-incredible.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute bottom-full left-1/2 -translate-x-1/2 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"
                  ></video>
                </span>{" "}
                your eye
              </p>
            </div>
          </FeatureCard>
          <FeatureCard
            title="Video-to-visual Insights"
            description="Transform video insights into visually engaging infographics."
            className="md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-auto group"
          >
            <div className="flex items-center justify-center aspect-video gap-4">
              <Key className="w-28 outline outline-2 outline-offset-4 outline-transparent group-hover:outline-lime-400 group-hover:translate-y-1 transition-all duration-500">
                Upload
              </Key>
              <Key className="w-28 outline outline-2 outline-offset-4 outline-transparent group-hover:outline-lime-400 group-hover:translate-y-1 transition-all duration-500 delay-150">
                Convert
              </Key>
              <Key className="w-28 outline outline-2 outline-offset-4 outline-transparent group-hover:outline-lime-400 group-hover:translate-y-1 transition-all duration-500 delay-300">
                Present
              </Key>
            </div>
          </FeatureCard>
        </div>
        <div className="justify-center items-center mt-5">
          <Tag>Coming Soon...</Tag>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {features.map((feature) => (
            <div
              key={feature}
              className="bg-[#F3F4F6] text-neutral-900 border-white/10 inline-flex px-3 md:px-5 py-1.5 md:py-2 rounded-2xl gap-3 items-center hover:scale-105 transition duration-500 group"
            >
              <span className="rounded-full size-5 text-xl inline-flex items-center justify-center bg-[#2463eb] text-neutral-200 group-hover:rotate-45 transition duration-500">
                &#10038;
              </span>
              <span className="font-medium md:text-lg">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
