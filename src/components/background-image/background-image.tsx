import React from "react";
import Image from "next/image";

interface ImageProps {
  imageName: string;
}

const BackgroundImage: React.FC<ImageProps> = ({ imageName }) => {
  return (
    <div className={`absolute h-full w-full -z-10`}>
      <Image
        src={`/${imageName}.jpg`}
        alt="Background"
        quality={100}
        fill={true}
        priority
      />
    </div>
  );
};

export default BackgroundImage;
