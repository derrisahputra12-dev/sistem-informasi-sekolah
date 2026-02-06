// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// File Limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png']
export const ALLOWED_FILE_TYPES = ['application/pdf']

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    maxStudents: 100,
    maxStaff: 20,
    features: ['ppdb', 'attendance'],
  },
  pro: {
    name: 'Pro',
    maxStudents: 500,
    maxStaff: 100,
    features: ['ppdb', 'attendance', 'e_raport', 'finance', 'library'],
  },
  enterprise: {
    name: 'Enterprise',
    maxStudents: -1, // unlimited
    maxStaff: -1, // unlimited
    features: ['ppdb', 'attendance', 'e_raport', 'finance', 'library', 'inventory', 'rpp', 'fingerprint'],
  },
} as const

// User Roles
export const USER_ROLES = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  teacher: 'Guru',
  staff: 'Staf',
  student: 'Siswa',
  parent: 'Orang Tua',
} as const

// Student Status
export const STUDENT_STATUS = {
  active: 'Aktif',
  graduated: 'Lulus',
  transferred: 'Pindah',
  dropped: 'Keluar',
} as const

// Religion Options
export const RELIGIONS = [
  'Islam',
  'Kristen',
  'Katolik',
  'Hindu',
  'Buddha',
  'Konghucu',
] as const

// Gender Options
export const GENDERS = {
  male: 'Laki-laki',
  female: 'Perempuan',
} as const
