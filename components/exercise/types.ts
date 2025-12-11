export enum ExerciseType {
  BODYWEIGHT = "BODYWEIGHT",
  STRENGTH = "STRENGTH",
}

export enum MovementPattern {
  PULL = "PULL",
  PUSH = "PUSH",
  SQUAT = "SQUAT",
  HINGE = "HINGE",
}

export type MusclePortion = { group: string; proportion: number };

export type RichExercise = {
  id: string;
  label: string;
  videoTitle?: string;
  videoUrl?: string;
  type: ExerciseType;
  description?: string;
  movementPattern?: MovementPattern;
  muscles: MusclePortion[];
};

export default {} as const;
