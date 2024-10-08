"use client";
import React, { useRef, useEffect } from "react";
import { ModelExample } from "@/components/canvas";
import { motion } from "framer-motion";
import { slideIn } from "../utils/motion";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error attempting to play the video:", error);
      });
    }
  }, []);

  return (
    // <div className="fixed inset-0">
    //   <video
    //     ref={videoRef}
    //     className="object-cover"
    //     src='/demoVideo.mp4'
    //     autoPlay
    //     loop
    //     muted
    //     playsInline
    //   />
    // </div>
    <div>
      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="xl:flex-1 xl:h-[1000px] md:h-[550px] h-[550px]"
      >
        <ModelExample />
      </motion.div>
    </div>
  );
}
