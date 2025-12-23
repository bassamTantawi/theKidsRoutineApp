export type Toast = {
  id: string;
  message: string;
  variant: "cheer" | "champ";
};

export function randomFrom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

