"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame, TrendingUp, BarChart3, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { CATEGORY_LABEL, type ExerciseCategory } from "@/types";
import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const PIE_COLORS = ["#C41230", "#f97316", "#3b82f6", "#22c55e"];

interface StatsData {
  streak: number;
  totalWeek: number;
  completedWeek: number;
  weeklyData: { day: string; total: number; completed: number }[];
  topExercises: { name: string; count: number }[];
  categoryData: { name: string; value: number }[];
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 28 },
  },
};

export default function StatsPage() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
  });

  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const categoryDataLabeled = (stats?.categoryData ?? []).map((d) => ({
    ...d,
    label: CATEGORY_LABEL[d.name as ExerciseCategory] ?? d.name,
  }));

  const topExercises = stats?.topExercises ?? [];
  const INITIAL_SHOW = 5;
  const displayedExercises = showAll ? topExercises : topExercises.slice(0, INITIAL_SHOW);
  const hasMore = topExercises.length > INITIAL_SHOW;

  return (
    <motion.div
      className="space-y-5 pb-32"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Statistik</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pantau progres dan konsistensi kamu.</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div className="grid grid-cols-3 gap-3" variants={cardVariants}>
        {[
          { icon: Flame, label: "Streak", value: stats?.streak ?? 0, suffix: "hari" },
          { icon: TrendingUp, label: "Selesai", value: stats?.completedWeek ?? 0, suffix: "" },
          { icon: BarChart3, label: "Tercatat", value: stats?.totalWeek ?? 0, suffix: "" },
        ].map(({ icon: Icon, label, value, suffix }) => (
          <div key={label} className="bg-white rounded-2xl border p-3 md:p-4 shadow-sm">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
              <Icon className="h-3 w-3 text-primary-600 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </div>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-2xl md:text-3xl font-black text-ink">{value}</span>
              {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Weekly bar chart */}
      <motion.div className="bg-white rounded-2xl border p-4 md:p-5 shadow-sm" variants={cardVariants}>
        <h2 className="font-bold text-ink text-sm md:text-base mb-4">7 Hari Terakhir</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats?.weeklyData ?? []} barSize={22} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12, padding: "8px 12px" }}
              cursor={{ fill: "#fef2f2" }}
            />
            <Bar dataKey="completed" name="Selesai" fill="#C41230" radius={[6, 6, 0, 0]} />
            <Bar dataKey="total" name="Total" fill="#fecaca" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom grid */}
      <motion.div className="grid md:grid-cols-2 gap-4" variants={cardVariants}>
        {/* Top exercises */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 md:p-5 pb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary-600 flex-shrink-0" />
            <h2 className="font-bold text-ink text-sm md:text-base">Latihan Teratas</h2>
          </div>

          {!topExercises.length ? (
            <div className="px-5 pb-5">
              <p className="text-sm text-muted-foreground">Belum ada data.</p>
            </div>
          ) : (
            <>
              <div className="px-4 md:px-5 space-y-2.5 pb-3">
                <AnimatePresence initial={false}>
                  {displayedExercises.map((ex, i) => (
                    <motion.div
                      key={ex.name}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" as const }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 py-0.5">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                          i === 0 ? "bg-primary-600 text-white" :
                          i === 1 ? "bg-primary-100 text-primary-700" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-ink truncate">{ex.name}</div>
                          <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden w-full">
                            <motion.div
                              className="h-full rounded-full bg-primary-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((ex.count / (topExercises[0]?.count || 1)) * 100, 100)}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" as const }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary-600 flex-shrink-0">{ex.count}x</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {hasMore && (
                <div className="px-5 py-3 border-t">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors w-full justify-center"
                  >
                    {showAll ? (
                      <><ChevronUp className="h-4 w-4" /> Tutup</>
                    ) : (
                      <><ChevronDown className="h-4 w-4" /> Lihat {topExercises.length - INITIAL_SHOW} lainnya</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Category pie */}
        <div className="bg-white rounded-2xl border p-4 md:p-5 shadow-sm">
          <h2 className="font-bold text-ink mb-4 text-sm md:text-base">Distribusi Kategori</h2>
          {!categoryDataLabeled.length ? (
            <p className="text-sm text-muted-foreground">Belum ada data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryDataLabeled}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={2}
                >
                  {categoryDataLabeled.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>}
                />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12, padding: "8px 12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}