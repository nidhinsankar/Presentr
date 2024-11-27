"use client";
import Tag from "@/components/ui/Tag";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    question: "What is the purpose of this tool?",
    answer:
      "Present AI automatically transforms YouTube videos into professional presentations, saving you hours of effort while ensuring high-quality results.",
  },
  {
    question: "Who is this tool designed for?",
    answer:
      "Our tool is perfect for professionals, educators, content creators, and anyone who needs to create engaging presentations quickly and efficiently.",
  },
  {
    question: "How does the video-to-presentation process work?",
    answer:
      "Simply upload a YouTube video link, and our AI will analyze its content to generate a structured, visually appealing presentation within seconds.",
  },
  {
    question: "What formats are supported for export?",
    answer:
      "Currently, you can export your presentations in PowerPoint (PPTX) format.",
  },
  {
    question: "Does the tool preserve the original style of the video?",
    answer:
      "We strive to capture the essence of your video by extracting key visuals, themes, and information, while presenting them in a clean, professional format.",
  },
];

export default function Faqs() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <section id="faqs" className="py-24">
      <div className="container">
        <div className="flex justify-center">
          <Tag>Faqs</Tag>
        </div>
        <h2 className="text-6xl text-center mt-6 font-medium max-w-xl mx-auto">
          Questions? We&apos;ve got{" "}
          <span className="text-[#2463eb]">answers</span>
        </h2>
        <div className="mt-12 flex flex-col gap-6 max-w-xl mx-auto">
          {faqs.map((faq, faqIndex) => (
            <div
              key={faq.question}
              className="text-neutral-900 bg-[#F3F4F6] border border-white/10 p-6 rounded-2xl"
            >
              <div
                className="flex items-center justify-between"
                onClick={() => setSelectedIndex(faqIndex)}
              >
                <h3 className="font-medium">{faq.question}</h3>
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
                  className={twMerge(
                    "feather feather-plus flex-shrink-0 text-[#2463eb] transition duration-300",
                    selectedIndex === faqIndex && "rotate-45"
                  )}
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <AnimatePresence>
                {selectedIndex === faqIndex && (
                  <motion.div
                    initial={{ height: 0, marginTop: 0 }}
                    animate={{ height: "auto", marginTop: 24 }}
                    exit={{ height: 0, marginTop: 0 }}
                    className={twMerge("overflow-hidden")}
                  >
                    <p className="text-neutral/50">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
