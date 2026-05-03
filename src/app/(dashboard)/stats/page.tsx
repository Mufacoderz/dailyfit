"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame, TrendingUp, BarChart3, Trophy } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { CATEGORY_LABEL, type ExerciseCategory } from "@/types";

const PIE_COLORS = ["#C41230", "#f97316", "#3b82f6", "#22c55e"];

interface StatsData {
  streak: number;
  totalWeek: number;
  completedWeek: number;
  weeklyData: { day: string; total: number; completed: number }[];
  topExercises: { name: string; count: number }[];
  categoryData: { name: string; value: number }[];
}

export default function StatsPage() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
  });

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Memuat statistik...</div>;
  }

  const categoryDataLabeled = (stats?.categoryData ?? []).map((d) => ({
    ...d,
    label: CATEGORY_LABEL[d.name as ExerciseCategory] ?? d.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Statistik</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pantau progres dan konsistensi Anda.</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Flame className="h-3.5 w-3.5 text-primary-600" /> Streak
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-ink">{stats?.streak ?? 0}</span>
            <span className="text-sm text-muted-foreground">hari</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary-600" /> Total Selesai
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-ink">{stats?.completedWeek ?? 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <BarChart3 className="h-3.5 w-3.5 text-primary-600" /> Total Tercatat
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-ink">{stats?.totalWeek ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="bg-white rounded-2xl border p-5 shadow-sm">
        <h2 className="font-bold text-ink mb-4">7 Hari Terakhir — Total Latihan</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats?.weeklyData ?? []} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Bar dataKey="completed" name="Selesai" fill="#C41230" radius={[6, 6, 0, 0]} />
            <Bar dataKey="total" name="Total" fill="#fecaca" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom 2 cols */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top exercises */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-primary-600" />
            <h2 className="font-bold text-ink">Top 3 Latihan</h2>
          </div>
          {!stats?.topExercises?.length ? (
            <p className="text-sm text-muted-foreground">Belum ada data.</p>
          ) : (
            <div className="space-y-3">
              {stats.topExercises.map((ex, i) => (
                <div key={ex.name} className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    i === 0 ? "bg-primary-600 text-white" :
                    i === 1 ? "bg-primary-100 text-primary-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{ex.name}</div>
                  </div>
                  <span className="text-sm font-bold text-primary-600">{ex.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category pie */}
        <div className="bg-white rounded-2xl border p-5 shadow-sm">
          <h2 className="font-bold text-ink mb-4">Distribusi Kategori</h2>
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
                >
                  {categoryDataLabeled.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>}
                />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
