"use client";

import { Pencil, Trash2, Dumbbell, Timer, Flame } from "lucide-react";
import { CATEGORY_LABEL, MUSCLE_GROUP_LABEL, exerciseDetail, type Exercise, type ExerciseCategory } from "@/types";

const CATEGORY_ACCENT: Record<ExerciseCategory, { bg: string; dot: string; label: string }> = {
  STRENGTH: { bg: "rgba(196,18,48,0.06)", dot: "#C41230", label: "rgba(196,18,48,0.85)" },
  CARDIO:   { bg: "rgba(234,88,12,0.06)", dot: "#ea580c", label: "rgba(234,88,12,0.85)" },
  BALANCE:  { bg: "rgba(37,99,235,0.06)", dot: "#2563eb", label: "rgba(37,99,235,0.85)" },
  FLEXIBILITY: { bg: "rgba(22,163,74,0.06)", dot: "#16a34a", label: "rgba(22,163,74,0.85)" },
};

interface Props {
  exercise: Exercise;
  onEdit: (ex: Exercise) => void;
  onDelete: (id: string) => void;
}

export function ExerciseCard({ exercise: ex, onEdit, onDelete }: Props) {
  const accent = CATEGORY_ACCENT[ex.category];
  const isTime = ex.type === "TIME_BASED";

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ border: "1.5px solid rgba(0,0,0,0.07)" }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: accent.dot, opacity: 0.7 }} />

      {/* Category background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${accent.bg} 0%, transparent 60%)` }}
      />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          {/* Icon + name */}
          <div className="flex items-start gap-2.5 min-w-0">
            <div
              className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center mt-0.5"
              style={{ background: accent.bg }}
            >
              {isTime
                ? <Timer className="h-4 w-4" style={{ color: accent.dot }} />
                : <Dumbbell className="h-4 w-4" style={{ color: accent.dot }} />
              }
            </div>
            <div className="min-w-0">
              <h3
                className="font-display text-[1.05rem] leading-tight truncate"
                style={{ color: "#0F0A0B" }}
              >
                {ex.name}
              </h3>
              <span
                className="text-[10px] font-semibold tracking-[1.5px] uppercase"
                style={{ color: accent.label }}
              >
                {CATEGORY_LABEL[ex.category]}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(ex)}
              className="h-7 w-7 rounded-lg flex items-center justify-center transition"
              style={{ background: "rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            >
              <Pencil className="h-3.5 w-3.5" style={{ color: "#888" }} />
            </button>
            <button
              onClick={() => onDelete(ex.id)}
              className="h-7 w-7 rounded-lg flex items-center justify-center transition"
              style={{ background: "rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,18,48,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            >
              <Trash2 className="h-3.5 w-3.5" style={{ color: "#C41230" }} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-3" style={{ background: "rgba(0,0,0,0.05)" }} />

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5" style={{ color: accent.dot, opacity: 0.7 }} />
            <span className="font-display text-[1.1rem]" style={{ color: "#0F0A0B" }}>
              {exerciseDetail(ex)}
            </span>
          </div>

          {/* Muscle group pill */}
          <span
            className="text-[10px] font-semibold tracking-[1px] uppercase px-2.5 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,0.05)", color: "#888" }}
          >
            {MUSCLE_GROUP_LABEL[ex.muscleGroup]}
          </span>
        </div>
      </div>
    </div>
  );
}