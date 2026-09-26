import React from "react";

// Universal Container Wrapper
export const AppTabContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full min-h-screen bg-black text-gray-100 flex flex-col items-center">
    <div className="w-full max-w-5xl px-4 md:px-6 py-6 space-y-6">
      {children}
    </div>
  </div>
);
