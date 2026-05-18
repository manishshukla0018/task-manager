/** Project members who can be assigned tasks (Member role only — not Admin). */
export const getAssignableMembers = (members = []) =>
  members.filter((m) => m.role === 'Member');
