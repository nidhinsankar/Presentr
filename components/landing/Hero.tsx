"use client";

import Button, { classes } from "@/components/landing/Button";
import design1Image from "@/assets/images/design-example-1.svg";
import design2Image from "@/assets/images/design-example-2.svg";
import Image from "next/image";
import Pointer from "@/components/landing/Pointer";
import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import cursorYouImage from "@/assets/images/cursor-you.svg";
import Link from "next/link";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";

export default function Hero({ user }: { user: KindeUser }) {
  const [leftDesignScope, leftDesignAnimate] = useAnimate();
  const [leftPointerScope, leftPointerAnimate] = useAnimate();
  const [rightDesignScope, rightDesignAnimate] = useAnimate();
  const [rightPointerScope, rightPointerAnimate] = useAnimate();

  useEffect(() => {
    leftDesignAnimate([
      [
        leftDesignScope.current,
        {
          opacity: 1,
        },
        { duration: 0.5 },
      ],
      [
        leftDesignScope.current,
        {
          y: 0,
          x: 0,
        },
        { duration: 0.5 },
      ],
    ]);

    leftPointerAnimate([
      [
        leftPointerScope.current,
        {
          opacity: 1,
        },
        {
          duration: 0.5,
        },
      ],
      [
        leftPointerScope.current,
        {
          y: 0,
          x: -100,
        },
        {
          duration: 0.5,
        },
      ],
      [
        leftPointerScope.current,
        {
          x: 0,
          y: [0, 16, 0],
        },
        {
          duration: 0.5,
          ease: "easeInOut",
        },
      ],
    ]);

    rightDesignAnimate([
      [
        rightDesignScope.current,
        {
          opacity: 1,
        },
        { duration: 0.5, delay: 1.5 },
      ],
      [
        rightDesignScope.current,
        { x: 0, y: 0 },
        {
          duration: 0.5,
        },
      ],
    ]);

    rightPointerAnimate([
      [
        rightPointerScope.current,
        {
          opacity: 1,
        },
        {
          duration: 0.5,
          delay: 1.5,
        },
      ],
      [
        rightPointerScope.current,
        {
          x: 175,
          y: 0,
        },
        {
          duration: 0.5,
        },
      ],
      [
        rightPointerScope.current,
        {
          x: 0,
          y: [0, 20, 0],
        },
        { duration: 0.5 },
      ],
    ]);
  }, []);

  return (
    <section
      className="py-24 overflow-x-clip"
      style={{ cursor: `url(${cursorYouImage.src}), auto` }}
    >
      <div className="container relative">
        <motion.div
          ref={leftDesignScope}
          initial={{ opacity: 0, y: 100, x: -100 }}
          drag
          className="absolute -left-32 top-16 hidden lg:block"
        >
          <Image src={design1Image} alt="Design 1 image" draggable="false" />
        </motion.div>
        <motion.div
          ref={leftPointerScope}
          initial={{ opacity: 0, y: 100, x: -200 }}
          className="absolute left-56 text-white top-96 hidden lg:block"
        >
          <Pointer name="Ervan" />
        </motion.div>

        <motion.div
          ref={rightDesignScope}
          initial={{ opacity: 0, x: 100, y: 100 }}
          drag
          className="absolute -right-64 -top-16 hidden lg:block"
        >
          <Image src={design2Image} alt="Design 2 image" draggable="false" />
        </motion.div>
        <motion.div
          ref={rightPointerScope}
          initial={{ opacity: 0, x: 275, y: 100 }}
          className="absolute right-80 text-white -top-4 hidden lg:block"
        >
          <Pointer name="Captain" color="red" />
        </motion.div>

        <div className="flex justify-center">
          <div className="py-1 px-3 inline-flex text-neutral-200 font-semibold bg-black rounded-full">
            ✨ Innovating the way you present
          </div>
        </div>
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-center mt-6">
          Turn your videos into jaw dropping presentations
        </h1>
        <p className="text-center text-xl text-gray-600 mt-8 max-w-2xl mx-auto">
          Your ideas deserve more than just words. Instantly transform YouTube
          videos into sleek, professional presentations with one click!
        </p>
        <div className="flex items-center justify-center border border-white/15 p-2 rounded-full mt-8 max-w-lg mx-auto">
          {user ? (
            <Link href={"/dashboard"}>
              <Button
                variant="primary"
                size="sm"
                className="whitespace-nowrap before:ease relative h-12 w-40 overflow-hidden border border-blue-500 bg-blue-500 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:blue-800 hover:before:-translate-x-40"
              >
                Get Started
              </Button>
            </Link>
          ) : (
            <LoginLink
              className={classes({
                variant: "primary",
                className:
                  "flex justify-center items-center whitespace-nowrap before:ease relative h-12 w-40 overflow-hidden border border-blue-500 bg-blue-500 text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-12 before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:blue-800 hover:before:-translate-x-40",
              })}
            >
              Log In
            </LoginLink>
          )}
        </div>
      </div>
    </section>
  );
}
