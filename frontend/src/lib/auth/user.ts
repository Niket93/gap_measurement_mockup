export function parseNameFromEmail(email: string) {
  const local = (email.split("@")[0] ?? "").trim();
  const parts = local.split(".").filter(Boolean);

  const clean = (s: string) =>
    s.replace(/[0-9]/g, "").replace(/[^a-zA-Z]/g, "");

  const cap = (s: string) =>
    s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s;

  const first = cap(clean(parts[0] ?? ""));
  const last = cap(clean(parts[1] ?? ""));

  return {
    firstName: first || "User",
    lastName: last || "",
    fullName: `${first || "User"}${last ? ` ${last}` : ""}`.trim()
  };
}
