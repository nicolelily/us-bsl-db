
export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

export interface UserRoleData {
  role: 'admin' | 'moderator' | 'user';
}

export interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  user_roles: UserRoleData[];
}
