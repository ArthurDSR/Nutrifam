import type { UserProfile } from '../types';

export function planProfilePatch(
  remote: UserProfile,
  values: Partial<UserProfile>,
  base: Partial<UserProfile>
): { accepted: Partial<UserProfile>; conflicting: Partial<UserProfile> } {
  const accepted: Partial<UserProfile> = {};
  const conflicting: Partial<UserProfile> = {};
  const same = (left: unknown, right: unknown) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
  for (const [field, value] of Object.entries(values)) {
    const key = field as keyof UserProfile;
    if (same(remote[key], base[key])) {
      Object.assign(accepted, { [key]: value });
    } else if (!same(remote[key], value)) {
      Object.assign(conflicting, { [key]: value });
    }
  }
  return { accepted, conflicting };
}
