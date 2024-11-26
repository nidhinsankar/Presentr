"use client";

import Button from "@/components/landing/Button";
import design1Image from "@/assets/images/design-example-1.png";
import design2Image from "@/assets/images/design-example-2.png";
import Image from "next/image";
import Pointer from "@/components/landing/Pointer";
import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import cursorYouImage from "@/assets/images/cursor-you.svg";

export default function Hero() {
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
          className="absolute left-56 top-96 hidden lg:block"
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
          className="absolute right-80 -top-4 hidden lg:block"
        >
          <Pointer name="Captain" color="red" />
        </motion.div>

        <div className="flex justify-center">
          <div className="py-1 px-3 inline-flex text-neutral-950 font-semibold bg-gradient-to-r from-purple-400 to-pink-400 rounded-full">
            ✨$7.5M seed round raised
          </div>
        </div>
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-center mt-6">
          Impactful design, created effortlessly
        </h1>
        <p className="text-center text-xl text-gray-600 mt-8 max-w-2xl mx-auto">
          Create stunning designs effortlessly using intuitive tools that bring
          your creative ideas to life, making every project impactful and
          unique.
        </p>
        <div className="flex items-center justify-center border border-white/15 p-2 rounded-full mt-8 max-w-lg mx-auto">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="whitespace-nowrap"
          >
            GET STARTED
          </Button>
        </div>
      </div>
    </section>
  );
}
