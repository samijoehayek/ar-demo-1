"use client"
import React, { useRef, useEffect } from 'react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error attempting to play the video:", error);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0">
      <video
        ref={videoRef}
        className="object-cover"
        src='/demoVideo.mp4'
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
}
