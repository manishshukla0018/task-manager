/**
 * Normalizes MongoDB ObjectId or populated document refs to a comparable id string.
 * Populated fields have _id; unpopulated fields stringify directly.
 */
export const toIdString = (ref) => {
  if (ref == null) return '';
  if (typeof ref === 'object' && ref._id != null) return ref._id.toString();
  return ref.toString();
};

export const isProjectMember = (project, userId) => {
  const id = toIdString(userId);
  return (
    toIdString(project.adminId) === id ||
    project.members.some((m) => toIdString(m) === id)
  );
};

export const isProjectAdmin = (project, userId) =>
  toIdString(project.adminId) === toIdString(userId);

export const canManageProject = (project, user) =>
  isProjectAdmin(project, user._id) || user.role === 'Admin';
