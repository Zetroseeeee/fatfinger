type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/**
 * Lightweight class-name joiner. Kept dependency-free (no clsx/tailwind-merge)
 * so the build never blocks on an extra install over a flaky network. Handles
 * strings, arrays and conditional objects - enough for everything here.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (val: ClassValue) => {
    if (!val) return;
    if (typeof val === "string" || typeof val === "number") {
      out.push(String(val));
    } else if (Array.isArray(val)) {
      val.forEach(walk);
    } else if (typeof val === "object") {
      for (const key in val) if (val[key]) out.push(key);
    }
  };
  inputs.forEach(walk);
  return out.join(" ");
}
