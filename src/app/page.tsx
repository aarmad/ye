"use client";

import { AudioProvider } from "@/context/AudioContext";
import MainLayout from "@/components/MainLayout";

export default function Home() {
  return (
    <AudioProvider>
      <MainLayout />
    </AudioProvider>
  );
}
