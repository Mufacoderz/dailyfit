"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ListChecks, Trash2, ChevronDown, ChevronUp, Dumbbell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exerciseDetail, CATEGORY_COLOR, CATEGORY_LABEL, type Plan, type Exercise } from "@/types";

export default function PlansPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => fetch("/api/plans").then((r) => r.json()),
  });

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Gagal menghapus");
    toast.success("Rencana dihapus");
    qc.invalidateQueries({ queryKey: ["plans"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">Rencana Latihan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Susun rangkaian latihan untuk dipakai berulang.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Buat Rencana</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Memuat...</div>
      ) : !plans?.length ? (
        <div className="border-2 border-dashed rounded-2xl p-12 text-center space-y-3">
          <ListChecks className="h-12 w-12 mx-auto text-slate-300" />
          <h3 className="font-semibold text-slate-700">Belum ada rencana</h3>
          <p className="text-sm text-muted-foreground">Susun rencana pertama Anda dari pustaka latihan.</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" /> Buat Rencana
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink">{plan.title}</h3>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{plan.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{plan.items?.length ?? 0} latihan</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition"
                  >
                    {expandedId === plan.id
                      ? <ChevronUp className="h-4 w-4 text-slate-500" />
                      : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              {expandedId === plan.id && plan.items && plan.items.length > 0 && (
                <div className="border-t px-4 py-3 space-y-2 bg-off">
                  {plan.items.map((item, i) => item.exercise && (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink">{item.exercise.name}</div>
                        <div className="text-xs text-muted-foreground">{exerciseDetail(item.exercise)}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLOR[item.exercise.category]}`}>
                        {CATEGORY_LABEL[item.exercise.category]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {createOpen && <CreatePlanModal onClose={() => setCreateOpen(false)} onSaved={() => qc.invalidateQueries({ queryKey: ["plans"] })} />}
    </div>
  );
}

function CreatePlanModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: () => fetch("/api/exercises").then((r) => r.json()),
  });

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Judul wajib diisi");
    setSaving(true);

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, exerciseIds: selectedIds }),
    });

    setSaving(false);
    if (!res.ok) return toast.error("Gagal menyimpan");
    toast.success("Rencana dibuat!");
    onClose();
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-ink">Buat Rencana Baru</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Judul</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Latihan Pagi"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Deskripsi (opsional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat..."
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Pilih Latihan ({selectedIds.length} dipilih)</label>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {!exercises?.length ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                <Dumbbell className="h-4 w-4" />
                Belum ada latihan di pustaka
              </div>
            ) : exercises.map((ex) => (
              <label key={ex.id} className="flex items-center gap-3 p-2.5 border rounded-xl cursor-pointer hover:bg-off transition">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(ex.id)}
                  onChange={() => toggle(ex.id)}
                  className="accent-primary-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink">{ex.name}</div>
                  <div className="text-xs text-muted-foreground">{exerciseDetail(ex)}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-off transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Buat Rencana"}
          </button>
        </div>
      </div>
    </div>
  );
}
