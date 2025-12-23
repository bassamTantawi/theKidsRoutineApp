"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Settings, SettingsTabKey } from "../data/settings";
import { defaultSettings } from "../data/settings";
import type { AppConfig } from "../data/config";
import { getAppConfig } from "../data/config";
import type { PeriodKey } from "../data/routines";
import { Chatbot } from "../components/shared/Chatbot";

export default function ParentsPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>("family");

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    return {
      app: { pageTitle: "Loading...", defaultMessage: "" },
      kids: [],
      lists: [],
      messages: { cheers: [], champMessages: [] },
    };
  });
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch config from Botpress first
  useEffect(() => {
    async function fetchConfig() {
      try {
        const config = await getAppConfig("default");
        setAppConfig(config);
        
        // Update page title dynamically
        if (config.app?.pageTitle) {
          document.title = config.app.pageTitle;
        }
        
        setSettings((prev) => {
          const updatedKids = prev.kids.map((kid) => {
            const configKid = config.kids.find((k) => k.name === kid.displayName);
            return configKid
              ? {
                  ...kid,
                  color: configKid.color,
                  label: configKid.label,
                  initial: configKid.initial,
                }
              : kid;
          });
          
          return {
            ...prev,
            kids: updatedKids,
          };
        });
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setConfigLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // load/save settings to localStorage
  useEffect(() => {
    if (appConfig.kids.length === 0) return;
    
    try {
      const raw = window.localStorage.getItem("kidsRoutineApp.settings.v1");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings((prev) => {
          const mergedKids = (parsed.kids ?? prev.kids).map((localKid) => {
            const configKid = appConfig.kids.find((k) => k.name === localKid.displayName);
            return configKid
              ? {
                  ...localKid,
                  color: configKid.color,
                  label: configKid.label,
                  initial: configKid.initial,
                }
              : localKid;
          });
          
          return {
            ...prev,
            ...parsed,
            kids: mergedKids,
            periods: parsed.periods ?? prev.periods,
            familyMembers: parsed.familyMembers ?? prev.familyMembers,
          };
        });
      }
    } catch {
      // ignore
    }
  }, [appConfig]);

  useEffect(() => {
    try {
      window.localStorage.setItem("kidsRoutineApp.settings.v1", JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-sky-100 to-emerald-100 font-sans text-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-zinc-700 shadow-sm ring-1 ring-black/5 backdrop-blur">
              {appConfig?.app?.pageTitle || "Loading..."}
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Parents View
            </h1>
            <p className="max-w-2xl text-sm text-zinc-700 sm:text-base">
              Manage family settings, routines, and calendar events.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setSettingsTab("family");
                  setSettingsOpen(true);
                }}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/70 px-4 text-sm font-extrabold text-zinc-900 shadow-sm ring-1 ring-black/5 backdrop-blur hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:w-auto"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-900 text-xs font-extrabold text-white">
                  {settings.kids[0]?.initial ?? "P"}
                </span>
                Setup
              </button>

              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/70 px-4 text-sm font-extrabold text-zinc-900 shadow-sm ring-1 ring-black/5 backdrop-blur hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:w-auto"
              >
                Kids View
              </Link>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <section className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
                <h2 className="mb-4 text-xl font-extrabold text-zinc-900">Welcome to Parents View</h2>
                <p className="text-sm text-zinc-700">
                  Use the <strong>Setup</strong> button above to configure your family settings, customize periods, and manage your kids' routines.
                </p>
              </section>

              <section className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
                <h2 className="mb-4 text-xl font-extrabold text-zinc-900">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsTab("family");
                      setSettingsOpen(true);
                    }}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 p-4 text-left text-white shadow-sm ring-1 ring-black/5 hover:from-emerald-600 hover:to-sky-600"
                  >
                    <div className="text-lg font-extrabold">Family Settings</div>
                    <div className="mt-1 text-sm text-white/90">Configure family members and kids</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsTab("periods");
                      setSettingsOpen(true);
                    }}
                    className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-left text-white shadow-sm ring-1 ring-black/5 hover:from-pink-600 hover:to-purple-600"
                  >
                    <div className="text-lg font-extrabold">Period Settings</div>
                    <div className="mt-1 text-sm text-white/90">Customize routine periods</div>
                  </button>
                </div>
              </section>
            </div>
            <div>
              <Chatbot height="600px" />
            </div>
          </div>
        </main>

        {/* Settings modal */}
        {settingsOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur sm:items-center">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/10">
              <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-extrabold text-white">Setup & Settings</p>
                  <p className="text-xs text-white/90">Customize your family and periods.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="h-10 rounded-xl bg-white/15 px-4 text-sm font-extrabold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Close
                </button>
              </div>

              <div className="p-5">
                <div className="mb-4 inline-flex overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-black/5">
                  <button
                    type="button"
                    onClick={() => setSettingsTab("family")}
                    className={[
                      "h-10 px-4 text-sm font-extrabold",
                      settingsTab === "family" ? "bg-white text-zinc-900" : "text-zinc-700 hover:bg-white/60",
                    ].join(" ")}
                  >
                    Family
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsTab("periods")}
                    className={[
                      "h-10 px-4 text-sm font-extrabold",
                      settingsTab === "periods" ? "bg-white text-zinc-900" : "text-zinc-700 hover:bg-white/60",
                    ].join(" ")}
                  >
                    Periods
                  </button>
                </div>

                {settingsTab === "family" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5">
                      <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                        Family members (comma separated)
                      </div>
                      <input
                        value={settings.familyMembers.join(", ")}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            familyMembers: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                        className="h-11 w-full rounded-xl bg-white px-4 text-sm font-semibold text-zinc-900 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Mira, Yazan, Mom, Dad"
                      />
                      <p className="mt-2 text-xs text-zinc-600">
                        Tip: these can be used for calendar participants later.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {settings.kids.map((k) => (
                        <div
                          key={k.key}
                          className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="text-sm font-extrabold text-zinc-900">
                              Kid key: <span className="font-black">{k.key}</span>
                            </div>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-900 ring-1 ring-amber-200">
                              Key must match routines JSON
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-1">
                              <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                                Display name
                              </div>
                              <input
                                value={k.displayName}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    kids: prev.kids.map((x) =>
                                      x.key === k.key ? { ...x, displayName: e.target.value } : x,
                                    ),
                                  }))
                                }
                                className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                              />
                            </label>

                            <label className="space-y-1">
                              <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                                Label
                              </div>
                              <input
                                value={k.label}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    kids: prev.kids.map((x) =>
                                      x.key === k.key ? { ...x, label: e.target.value } : x,
                                    ),
                                  }))
                                }
                                className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                              />
                            </label>

                            <label className="space-y-1">
                              <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                                Initial
                              </div>
                              <input
                                value={k.initial}
                                maxLength={2}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    kids: prev.kids.map((x) =>
                                      x.key === k.key ? { ...x, initial: e.target.value } : x,
                                    ),
                                  }))
                                }
                                className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                              />
                            </label>

                            <label className="space-y-1">
                              <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                                Color
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={k.color}
                                  onChange={(e) =>
                                    setSettings((prev) => ({
                                      ...prev,
                                      kids: prev.kids.map((x) =>
                                        x.key === k.key ? { ...x, color: e.target.value } : x,
                                      ),
                                    }))
                                  }
                                  className="h-11 w-20 cursor-pointer rounded-xl border-0 bg-zinc-50 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                />
                                <input
                                  type="text"
                                  value={k.color}
                                  onChange={(e) =>
                                    setSettings((prev) => ({
                                      ...prev,
                                      kids: prev.kids.map((x) =>
                                        x.key === k.key ? { ...x, color: e.target.value } : x,
                                      ),
                                    }))
                                  }
                                  placeholder="#a855f7"
                                  className="h-11 flex-1 rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                />
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSettings(defaultSettings)}
                        className="h-11 rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                      >
                        Reset to defaults
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(
                      [
                        ["morning", "Morning"],
                        ["afterSchool", "After School"],
                        ["beforeSleep", "Before Sleep"],
                      ] as Array<[PeriodKey, string]>
                    ).map(([key, fallback]) => (
                      <div
                        key={key}
                        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-extrabold text-zinc-900">{fallback}</div>
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-extrabold text-zinc-700 ring-1 ring-black/5">
                            {key}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1">
                            <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                              Label
                            </div>
                            <input
                              value={settings.periods[key]?.label ?? fallback}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  periods: {
                                    ...prev.periods,
                                    [key]: { ...prev.periods[key], label: e.target.value },
                                  },
                                }))
                              }
                              className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                          </label>
                          <label className="space-y-1">
                            <div className="text-xs font-extrabold uppercase tracking-wide text-zinc-600">
                              Helper text
                            </div>
                            <input
                              value={settings.periods[key]?.helper ?? ""}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  periods: {
                                    ...prev.periods,
                                    [key]: { ...prev.periods[key], helper: e.target.value },
                                  },
                                }))
                              }
                              className="h-11 w-full rounded-xl bg-zinc-50 px-4 text-sm font-semibold ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-pink-400"
                              placeholder="Optional"
                            />
                          </label>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
                      Note: routines still come from your routines JSON; this only changes labels shown in the UI.
                    </div>

                    <button
                      type="button"
                      onClick={() => setSettings(defaultSettings)}
                      className="h-11 rounded-xl bg-zinc-900 px-5 text-sm font-extrabold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    >
                      Reset to defaults
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

