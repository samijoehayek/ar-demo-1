import React from "react";

interface LoaderMTProps {
  progress: number;
}

const LoaderMT: React.FC<LoaderMTProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-full max-w-md px-4">
        <div className="mb-2 text-center text-white text-xl font-bold">
          Loading... {Math.round(progress)}%
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-yellow-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoaderMT;
