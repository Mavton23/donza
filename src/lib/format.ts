import type { Instructor, PersonCard, User } from '@/lib/api/types';

export const displayName = (u: Pick<User, 'username' | 'fullName'> & { institutionName?: string | null } | Instructor | PersonCard) =>
  ('name' in u && u.name) || ('institutionName' in u && u.institutionName) || ('fullName' in u && u.fullName) || u.username;
