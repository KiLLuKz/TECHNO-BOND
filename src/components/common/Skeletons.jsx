import React from 'react';

// Reusable animated block
const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl border border-white/10 ${className}`} />
);

export const ProfileSkeleton = () => (
  <div className="w-full max-w-2xl mx-auto space-y-6">
    <SkeletonBlock className="h-[400px] w-full" />
  </div>
);

export const DirectorySkeleton = () => (
  <div className="w-full space-y-6">
    <SkeletonBlock className="h-[600px] w-full" />
  </div>
);

export const SeniorMissionsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
    <SkeletonBlock className="h-[500px] w-full" />
    <SkeletonBlock className="h-[500px] w-full" />
  </div>
);

export const JuniorMissionsSkeleton = () => (
  <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
      <SkeletonBlock className="h-[300px] w-full" />
      <SkeletonBlock className="h-[300px] w-full" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full items-stretch mt-6">
      <SkeletonBlock className="h-[200px] w-full" />
      <SkeletonBlock className="h-[200px] w-full" />
    </div>
  </>
);
