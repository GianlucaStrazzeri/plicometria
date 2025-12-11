"use client";

import React, { useEffect, useState } from "react";

type Client = { id: string; nombre: string };
type Assignment = {
  id: string;
  clientId: string | null;
  exerciseLabel: string;
  targetSeries?: number;
  targetReps?: number;
};

const CLIENTS_KEY = "cr_clients_v1";
const ASSIGNMENTS_KEY = "cr_assignments_v1";

import ExercisePage from "@/components/exercise/exercise";

export default function Page() {
  return <ExercisePage />;
}
