let currentVersion = `${Date.now()}`;

export function getVersion(): string {
  return currentVersion;
}

export function bumpVersion(reason?: string) {
  // Use timestamp plus a small counter/random to avoid same-tick duplicates
  currentVersion = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}