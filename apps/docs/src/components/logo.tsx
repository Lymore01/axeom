"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Logo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const AxeomLogo = () => (
    <div className="relative w-12 h-12 group-hover:scale-105 transition-transform duration-700 ease-in-out">
      <Image
        src="/images/icon-light.png"
        alt="Axeom Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );

  if (!mounted) {
    return (
      <div className="flex items-center gap-1">
        <div className="text-white">
          <AxeomLogo />
        </div>
        <span className="font-bold text-sm tracking-[0.2em] uppercase">
          Axeom.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <div className="text-white">
        <AxeomLogo />
      </div>
      <span className="font-bold text-sm tracking-[0.2em] uppercase transition-colors group-hover:text-white/80">
        Axeom.
      </span>
    </div>
  );
}
