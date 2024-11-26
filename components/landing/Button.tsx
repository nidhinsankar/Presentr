import React, { ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";

const classes = cva("px-6 h-12 font-medium border rounded-full", {
  variants: {
    variant: {
      primary: "bg-[#2463eb] text-neutral-200 border-[#2463eb]",
      secondary: "border-white text-white bg-transparent",
    },
    size: {
      sm: "h-10",
    },
  },
});

export default function Button(
  props: {
    variant: "primary" | "secondary";
    size?: "sm";
  } & ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { variant, className, size, ...otherProps } = props;
  return (
    <button className={classes({ variant, size, className })} {...otherProps} />
  );
}
