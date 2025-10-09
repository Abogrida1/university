export interface Department {
  id: string;
  name: string;
  programs: string[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  departmentName: string;
  program: string;
  year: number;
  term: 'FIRST' | 'SECOND';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  courseId: string;
  type: 'pdf' | 'video' | 'notes';
  title: string;
  url: string;
  filename?: string;
  uploaderId: string;
  uploadedAt: string;
  downloads: number;
  tags: string[];
  departmentId: string;
  program: string;
  year: number;
  term: 'FIRST' | 'SECOND';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'student';
  department?: string;
  year?: number;
  term?: 'FIRST' | 'SECOND';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  permissions: string[];
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
  lastActivity: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  activityType: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  name?: string; // للحفاظ على التوافق مع الكود القديم
  department: string;
  year: number;
  term: 'FIRST' | 'SECOND';
}

export interface AuditLog {
  id: string;
  actorUid: string;
  action: 'create' | 'update' | 'delete' | 'download';
  targetCollection: string;
  targetId?: string;
  timestamp: string;
  meta: Record<string, any>;
}
