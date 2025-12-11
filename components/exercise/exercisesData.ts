export type Exercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment?: string[];
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  description?: string;
  cues?: string[];
  videoUrl?: string;
  variations?: { id: string; name: string }[];
  tags?: string[];
};

export const EXERCISES: Exercise[] = [
  {
    id: "squat_goblet",
    name: "Sentadilla Goblet",
    primaryMuscles: ["cuádriceps", "glúteo mayor"],
    secondaryMuscles: ["isquiotibiales", "core"],
    equipment: ["kettlebell", "mancuerna"],
    category: "Fuerza",
    difficulty: "beginner",
    description:
      "Sentadilla realizada sujetando el peso delante del pecho; buena para enseñar la mecánica de la sentadilla.",
    cues: ["Pies anchura hombros", "Empuja con talones", "Mantén pecho alto"],
    videoUrl: "",
    variations: [{ id: "squat_goblet_light", name: "Goblet - ligero" }],
    tags: ["piernas", "kettlebell"],
  },
  {
    id: "push_up_standard",
    name: "Flexión de brazos (estándar)",
    primaryMuscles: ["pectorales"],
    secondaryMuscles: ["tríceps", "hombros"],
    equipment: [],
    category: "Fuerza",
    difficulty: "beginner",
    description: "Flexión clásica en el suelo.",
    cues: ["Cuerpo recto", "Baja hasta que el pecho casi toque el suelo"],
    tags: ["pecho", "peso corporal"],
  },
  {
    id: "deadlift_rdl",
    name: "Peso muerto rumano (RDL)",
    primaryMuscles: ["isquiotibiales", "glúteos"],
    equipment: ["barra", "mancuernas"],
    category: "Fuerza",
    difficulty: "intermediate",
    description: "Trabajo de cadena posterior, enfatiza la bisagra de cadera.",
    cues: ["Bisagra de cadera", "Mantén la barra cerca del cuerpo"],
    tags: ["posterior", "hip hinge"],
  },
];