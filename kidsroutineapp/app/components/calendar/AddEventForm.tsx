"use client";

import { useState } from "react";
import type { Settings } from "../../data/settings";

type AddEventFormProps = {
  date: string;
  settings: Settings;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddEventForm({ date, settings, onClose, onSuccess }: AddEventFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    participants: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          name: formData.name,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          location: formData.location || undefined,
          description: formData.description || undefined,
          participants: formData.participants.length > 0 ? formData.participants : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create event");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      alert(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/10">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-4">
          <div className="space-y-0.5">
            <p className="text-sm font-extrabold text-white">Add New Event</p>
            <p className="text-xs text-white/90">{date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-white/15 px-4 text-sm font-extrabold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                Event Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold text-zinc-900 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., School Winter Show"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                  Start Time
                </span>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                  className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold text-zinc-900 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                  End Time
                </span>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold text-zinc-900 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                Location
              </span>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold text-zinc-900 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., School Auditorium"
              />
            </label>

            <div className="block space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                Participants
              </span>
              <div className="flex flex-wrap gap-2">
                {settings.familyMembers.map((member) => {
                  const isSelected = formData.participants.includes(member);
                  return (
                    <button
                      key={member}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          participants: isSelected
                            ? prev.participants.filter((p) => p !== member)
                            : [...prev.participants, member],
                        }));
                      }}
                      className={[
                        "h-10 rounded-xl px-4 text-sm font-extrabold ring-1 transition-all active:scale-95",
                        isSelected
                          ? "bg-emerald-500 text-white ring-emerald-600 hover:bg-emerald-600"
                          : "bg-zinc-100 text-zinc-700 ring-zinc-300 hover:bg-zinc-200",
                      ].join(" ")}
                    >
                      {member}
                    </button>
                  );
                })}
              </div>
              {formData.participants.length > 0 && (
                <div className="mt-2 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900">
                    Selected: {formData.participants.join(", ")}
                  </p>
                </div>
              )}
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                Description
              </span>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Optional details about the event..."
              />
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-zinc-100 px-4 text-sm font-extrabold text-zinc-900 hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.name.trim()}
              className="flex-1 h-11 rounded-xl bg-emerald-500 px-4 text-sm font-extrabold text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

