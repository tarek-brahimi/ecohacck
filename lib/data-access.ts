import { RowDataPacket } from 'mysql2';

import { execute, query, type SqlValue } from '@/lib/db';

import type {
  Activity,
  ActivityCategory,
  ActivityEnrollment,
  AgeGroup,
  ActivityStatus,
  DifficultyLevel,
  LeaderboardEntry,
  User,
  UserProfile,
  UserRole,
} from '@/lib/types';
import { hashPassword } from '@/lib/auth';

type DbDate = Date | string | null | undefined;

type UserRow = RowDataPacket & {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  age_group: AgeGroup;
  interests: string | string[] | null;
  points: number;
  role: UserRole;
  bio: string | null;
  avatar: string | null;
  created_at: DbDate;
};

type ActivityRow = RowDataPacket & {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  location: string;
  latitude: number;
  longitude: number;
  date: DbDate;
  image_url: string;
  difficulty_level: DifficultyLevel;
  organizer_id: string;
  house_owner_id: string | null;
  status: ActivityStatus;
  approved_at: DbDate;
  enrollment_count: number;
  created_at: DbDate;
};

type EnrollmentRow = RowDataPacket & {
  id: string;
  user_id: string;
  activity_id: string;
  enrolled_at: DbDate;
};

function toDate(value: DbDate) {
  return value instanceof Date ? value : value ? new Date(value) : new Date();
}

function parseInterests(value: UserRow['interests']) {
  if (!value) {
    return [] as ActivityCategory[];
  }

  if (Array.isArray(value)) {
    return value as ActivityCategory[];
  }

  try {
    return JSON.parse(value) as ActivityCategory[];
  } catch {
    return [] as ActivityCategory[];
  }
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    ageGroup: row.age_group,
    interests: parseInterests(row.interests),
    points: row.points,
    role: row.role,
    createdAt: toDate(row.created_at),
  };
}

function toUserProfile(row: UserRow, joinedActivities: string[]): UserProfile {
  return {
    ...toUser(row),
    bio: row.bio,
    avatar: row.avatar,
    joinedActivities,
  };
}

function toActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    date: toDate(row.date),
    imageUrl: row.image_url,
    difficultyLevel: row.difficulty_level,
    organizerId: row.organizer_id,
    houseOwnerId: row.house_owner_id ?? '',
    status: row.status,
    enrollmentCount: Number(row.enrollment_count),
    createdAt: toDate(row.created_at),
    approvedAt: row.approved_at ? toDate(row.approved_at) : null,
  };
}

function toEnrollment(row: EnrollmentRow): ActivityEnrollment {
  return {
    id: row.id,
    userId: row.user_id,
    activityId: row.activity_id,
    enrolledAt: toDate(row.enrolled_at),
  };
}

function buildTextSearch(search?: string) {
  if (!search) {
    return { clause: '', params: [] as SqlValue[] };
  }

  return {
    clause: ' AND (u.full_name LIKE ? OR u.email LIKE ?)',
    params: [`%${search}%`, `%${search}%`],
  };
}

async function fetchUserRowById(userId: string) {
  const rows = await query<UserRow[]>(
    'SELECT id, email, password_hash, full_name, age_group, interests, points, role, bio, avatar, created_at FROM users WHERE id = ? LIMIT 1',
    [userId]
  );

  return rows[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const rows = await query<UserRow[]>(
    'SELECT id, email, password_hash, full_name, age_group, interests, points, role, bio, avatar, created_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  return rows[0] ?? null;
}

export async function getUserById(userId: string): Promise<User | null> {
  const row = await fetchUserRowById(userId);
  return row ? toUser(row) : null;
}

export async function createUser(input: {
  email: string;
  password: string;
  fullName: string;
  ageGroup: AgeGroup;
  interests: ActivityCategory[];
  role?: UserRole;
}) {
  const id = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const passwordHash = await hashPassword(input.password);

  await execute(
    'INSERT INTO users (id, email, password_hash, full_name, age_group, interests, points, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [id, input.email, passwordHash, input.fullName, input.ageGroup, JSON.stringify(input.interests), 0, input.role ?? 'user']
  );

  return getUserById(id);
}

export async function updateUserRole(userId: string, role: UserRole) {
  await execute('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?', [role, userId]);
  return getUserById(userId);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'fullName' | 'ageGroup' | 'interests' | 'bio' | 'avatar'>>
): Promise<User | null> {
  const fields: string[] = [];
  const params: SqlValue[] = [];

  if (updates.fullName) {
    fields.push('full_name = ?');
    params.push(updates.fullName);
  }

  if (updates.ageGroup) {
    fields.push('age_group = ?');
    params.push(updates.ageGroup);
  }

  if (updates.interests) {
    fields.push('interests = ?');
    params.push(JSON.stringify(updates.interests));
  }

  if (updates.bio !== undefined) {
    fields.push('bio = ?');
    params.push(updates.bio);
  }

  if (updates.avatar !== undefined) {
    fields.push('avatar = ?');
    params.push(updates.avatar);
  }

  if (!fields.length) {
    return getUserById(userId);
  }

  params.push(userId);
  await execute(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
  return getUserById(userId);
}

export async function listUsers(filters?: { role?: UserRole; search?: string }) {
  const search = buildTextSearch(filters?.search);
  const rows = await query<Array<UserRow & { activity_count: number }>>(
    `SELECT u.id, u.email, u.password_hash, u.full_name, u.age_group, u.interests, u.points, u.role, u.bio, u.avatar, u.created_at,
      COUNT(DISTINCT e.id) AS activity_count
     FROM users u
     LEFT JOIN activity_enrollments e ON e.user_id = u.id
     WHERE 1 = 1${filters?.role ? ' AND u.role = ?' : ''}${search.clause}
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    [
      ...(filters?.role ? [filters.role] : []),
      ...search.params,
    ]
  );

  return rows.map((row) => ({
    ...toUser(row),
    activityCount: row.activity_count,
  }));
}

export async function getUserProfile(userId: string) {
  const row = await fetchUserRowById(userId);
  if (!row) {
    return null;
  }

  const activities = await query<Array<RowDataPacket & { activity_id: string }>>(
    'SELECT activity_id FROM activity_enrollments WHERE user_id = ? ORDER BY enrolled_at DESC',
    [userId]
  );

  return toUserProfile(row, activities.map((activity) => activity.activity_id));
}

export async function listActivities(filters?: { category?: ActivityCategory; search?: string; status?: ActivityStatus | 'all'; houseOwnerId?: string }) {
  const params: SqlValue[] = [];
  const whereParts: string[] = [];

  if (filters?.category) {
    whereParts.push('a.category = ?');
    params.push(filters.category);
  }

  if (filters?.search) {
    whereParts.push('(a.title LIKE ? OR a.description LIKE ? OR a.location LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters?.status && filters.status !== 'all') {
    whereParts.push('a.status = ?');
    params.push(filters.status);
  } else if (!filters?.status) {
    whereParts.push("a.status = 'public'");
  }

  if (filters?.houseOwnerId) {
    whereParts.push('a.house_owner_id = ?');
    params.push(filters.houseOwnerId);
  }

  const rows = await query<ActivityRow[]>(
    `SELECT a.id, a.title, a.description, a.category, a.location, a.latitude, a.longitude, a.date, a.image_url,
      a.difficulty_level, a.organizer_id, a.house_owner_id, a.status, a.approved_at, a.enrollment_count, a.created_at
     FROM activities a
     ${whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''}
     ORDER BY a.date ASC`,
    params
  );

  return rows.map(toActivity);
}

export async function getActivity(activityId: string) {
  const rows = await query<ActivityRow[]>(
    'SELECT id, title, description, category, location, latitude, longitude, date, image_url, difficulty_level, organizer_id, house_owner_id, status, approved_at, enrollment_count, created_at FROM activities WHERE id = ? LIMIT 1',
    [activityId]
  );

  return rows[0] ? toActivity(rows[0]) : null;
}

export async function createActivity(input: Omit<Activity, 'id' | 'createdAt' | 'enrollmentCount' | 'approvedAt'>) {
  const id = `activity_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const status = input.status ?? 'pending';

  await execute(
    `INSERT INTO activities (
      id, title, description, category, location, latitude, longitude, date, image_url,
      difficulty_level, organizer_id, house_owner_id, status, approved_at, enrollment_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      id,
      input.title,
      input.description,
      input.category,
      input.location,
      input.latitude,
      input.longitude,
      input.date,
      input.imageUrl,
      input.difficultyLevel,
      input.organizerId,
      input.houseOwnerId,
      status,
      status === 'public' ? new Date() : null,
      0,
    ]
  );

  return getActivity(id);
}

export async function updateActivityStatus(activityId: string, status: ActivityStatus) {
  await execute(
    'UPDATE activities SET status = ?, approved_at = ?, updated_at = NOW() WHERE id = ?',
    [status, status === 'public' ? new Date() : null, activityId]
  );

  return getActivity(activityId);
}

export async function deleteActivity(activityId: string) {
  await execute('DELETE FROM activities WHERE id = ?', [activityId]);
}

export async function toggleEnrollment(userId: string, activityId: string) {
  const activity = await getActivity(activityId);
  if (!activity || activity.status !== 'public') {
    throw new Error('Activity is not available for enrollment yet.');
  }

  const existing = await query<EnrollmentRow[]>(
    'SELECT id, user_id, activity_id, enrolled_at FROM activity_enrollments WHERE user_id = ? AND activity_id = ? LIMIT 1',
    [userId, activityId]
  );

  if (existing[0]) {
    await execute('DELETE FROM activity_enrollments WHERE id = ?', [existing[0].id]);
    await execute('UPDATE activities SET enrollment_count = GREATEST(enrollment_count - 1, 0), updated_at = NOW() WHERE id = ?', [activityId]);
    return { enrolled: false, enrollment: null };
  }

  const id = `enrollment_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await execute('INSERT INTO activity_enrollments (id, user_id, activity_id, enrolled_at) VALUES (?, ?, ?, NOW())', [id, userId, activityId]);
  await execute('UPDATE activities SET enrollment_count = enrollment_count + 1, updated_at = NOW() WHERE id = ?', [activityId]);

  const rows = await query<EnrollmentRow[]>('SELECT id, user_id, activity_id, enrolled_at FROM activity_enrollments WHERE id = ? LIMIT 1', [id]);
  return { enrolled: true, enrollment: rows[0] ? toEnrollment(rows[0]) : null };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const rows = await query<Array<RowDataPacket & { user_id: string; full_name: string; points: number; activity_count: number }>>(
    `SELECT u.id AS user_id, u.full_name, u.points, COUNT(e.id) AS activity_count
     FROM users u
     LEFT JOIN activity_enrollments e ON e.user_id = u.id
     WHERE u.role = 'user'
     GROUP BY u.id
     ORDER BY u.points DESC, u.full_name ASC`
  );

  return rows.map((row, index) => ({
    userId: row.user_id,
    userName: row.full_name,
    points: Number(row.points),
    rank: index + 1,
    activities: Number(row.activity_count),
  }));
}