"use client";
import React, { useState, useEffect } from "react";
import { ModelExampleAnimations, ThreeJSAnimation } from "@/components/canvas";
import { motion } from "framer-motion";
import { slideIn } from "../utils/motion";
import BackgroundImage from "@/components/background-image/background-image";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // Consider mobile if width is less than 768px
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

export default function Home() {
  const mobile = useIsMobile();

  return (
    <div>
      {/* <BackgroundImage imageName={mobile ? "bg-image-mobile" : "bg-image"} /> */}
      {/* <motion.div variants={slideIn("right", "tween", 0.2, 1)}> */}
      <ModelExampleAnimations />
      {/* <ThreeJSAnimation /> */}
      {/* </motion.div> */}
    </div>
  );
}
