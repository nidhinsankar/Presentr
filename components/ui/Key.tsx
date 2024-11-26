import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function Key(props: HTMLAttributes<HTMLDivElement>) {
  const { className, children, ...otherProps } = props;
  return (
    <div
      className={twMerge(
        "font-medium bg-neutral-300 size-14 inline-flex items-center justify-center rounded-2xl text-xl text-neutral-950",
        className
      )}
      {...otherProps}
    >
      {children}
    </div>
  );
}
