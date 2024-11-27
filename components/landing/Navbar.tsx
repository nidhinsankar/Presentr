"use client";
import Image from "next/image";
import logoImage from "@/assets/images/logo.svg";
import Button, { classes } from "@/components/landing/Button";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import ProfilePopover from "../ProfilePopover";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#features" },
  { label: "FAQs", href: "#faqs" },
];

const LoggedLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Create Slides", href: "/generate-slides" },
];

export default function Navbar({ user }: { user: KindeUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  });
  return (
    <>
      <section className="py-4 lg:py-8 fixed w-full top-0 z-50">
        <div className="container max-w-5xl">
          <div
            ref={navbarRef}
            className="border border-white/15 rounded-[27px] md:rounded-full bg-black/60 text-white backdrop-blur"
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 p-2 px-4 md:pr-2 items-center">
              <div>
                <Link href={"/"}>
                  <Image
                    src={logoImage}
                    alt="Layers logo"
                    className="h-9 w-auto md:h-auto"
                  />
                </Link>
              </div>
              <div className="lg:flex items-center justify-center hidden">
                {user ? (
                  <>
                    <nav className="flex gap-6 font-medium">
                      {LoggedLinks.map((link) => (
                        <Link href={link.href} key={link.label}>
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </>
                ) : (
                  <nav className="flex gap-6 font-medium">
                    {navLinks.map((link) => (
                      <Link href={link.href} key={link.label}>
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-menu md:hidden"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <line
                    x1="3"
                    y1="6"
                    x2="21"
                    y2="6"
                    className={twMerge(
                      "origin-left transition",
                      isOpen && "rotate-45 -translate-y-1"
                    )}
                  ></line>
                  <line
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                    className={twMerge("transition", isOpen && "opacity-0")}
                    onClick={() => setIsOpen(!isOpen)}
                  ></line>
                  <line
                    x1="3"
                    y1="18"
                    x2="21"
                    y2="18"
                    className={twMerge(
                      "origin-left transition",
                      isOpen && "-rotate-45 translate-y-1"
                    )}
                  ></line>
                </svg>
                {user ? (
                  <>
                    <ProfilePopover user={user} tokenCount={10} />
                  </>
                ) : (
                  <>
                    <LoginLink
                      className={classes({
                        variant: "secondary",
                        className: "flex justify-center items-center",
                      })}
                    >
                      Log In
                    </LoginLink>
                    <RegisterLink
                      className={classes({
                        variant: "primary",
                        className:
                          "flex hover:bg-blue-700 justify-center items-center",
                      })}
                    >
                      Sign Up
                    </RegisterLink>
                  </>
                )}
              </div>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-4 py-4">
                    {user ? (
                      <>
                        <nav className="flex gap-6 font-medium">
                          {LoggedLinks.map((link) => (
                            <Link href={link.href} key={link.label}>
                              {link.label}
                            </Link>
                          ))}
                        </nav>
                      </>
                    ) : (
                      <nav className="flex gap-6 font-medium">
                        {navLinks.map((link) => (
                          <Link href={link.href} key={link.label}>
                            {link.label}
                          </Link>
                        ))}
                      </nav>
                    )}
                    {user ? (
                      <>
                        <ProfilePopover user={user} tokenCount={10} />
                      </>
                    ) : (
                      <>
                        <LoginLink
                          className={classes({
                            variant: "secondary",
                            className: "flex justify-center items-center",
                          })}
                        >
                          Log In
                        </LoginLink>
                        <RegisterLink
                          className={classes({
                            variant: "primary",
                            className: "flex justify-center items-center",
                          })}
                        >
                          Sign Up
                        </RegisterLink>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
      <div className="pb-[86px] md:pb-[98px] lg:pb-[130px]"></div>
    </>
  );
}
