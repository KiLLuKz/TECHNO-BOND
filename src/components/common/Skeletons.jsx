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

export const GameProgressSkeleton = () => (
 <div className="w-full bg-[#08050f]/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl animate-pulse mt-8">
 <div className="h-6 w-48 bg-white/10 rounded-full mb-6"></div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[1, 2, 3].map(i => (
 <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
 <div className="flex justify-between mb-4">
 <div className="h-5 w-24 bg-white/10 rounded-full"></div>
 <div className="h-5 w-16 bg-white/10 rounded-full"></div>
 </div>
 <div className="h-2 w-full bg-white/5 rounded-full"></div>
 </div>
 ))}
 </div>
 </div>
);
