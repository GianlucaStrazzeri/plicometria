"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Client-only mount of the Exercise component
const Exercise = dynamic(() => import("@/components/exercise/exercise"), { ssr: false });

export default function ExercisePage() {
  const router = useRouter();

  function goHome() {
    router.push("/");
  }
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Exercise</h1>
        <div className="mb-4">
          <Button variant="outline" onClick={goHome}>
            Vista
          </Button>
        </div>
        <Exercise />
      </div>
    </main>
  );
}
