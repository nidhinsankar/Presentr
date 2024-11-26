import { twMerge } from "tailwind-merge";

export default function FeatureCard(props: {
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const { title, description, className, children } = props;
  return (
    <div
      className={twMerge(
        "bg-[#F3F4F6] text-neutral-700 border border-white/10 p-6 rounded-3xl",
        className
      )}
    >
      <div className="aspect-video">{children}</div>
      <div className="">
        <h3 className="text-3xl font-medium mt-6">{title}</h3>
        <p className="text-neutral/70 mt-2">{description}</p>
      </div>
    </div>
  );
}
