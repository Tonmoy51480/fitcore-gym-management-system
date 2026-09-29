import type {
  DashboardSummary,
  GlobalSearchResult,
  LoginResponse,
  Member,
  MemberCreatePayload,
  MemberDetail,
  MemberGrowthReport,
  MemberRenewPayload,
  MemberUpdatePayload,
  MembershipPlan,
  MembershipPlanCreatePayload,
  MembershipPlanUpdatePayload,
  NotificationItem,
  Payment,
  PaymentCreatePayload,
  RevenueReport,
  Trainer,
  TrainerCreatePayload,
  TrainerDetail,
  TrainerReportItem,
  TrainerUpdatePayload,
  User,
  Workout,
  WorkoutCreatePayload,
  WorkoutUpdatePayload,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('fitcore_token') || localStorage.getItem('aura_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : errorMsg);
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    login: (body: { usernameOrEmail: string; password: string; rememberMe?: boolean }) =>
      request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    register: (body: { username: string; email: string; password: string; fullName: string; phone?: string; role?: string }) =>
      request<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    me: () => request<User>('/auth/me'),
    updateProfile: (body: { fullName: string; email: string; phone?: string; avatarUrl?: string }) =>
      request<User>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  // Members
  members: {
    getAll: (params?: { search?: string; status?: string; planId?: number }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);
      if (params?.planId) query.append('planId', params.planId.toString());
      return request<Member[]>(`/member?${query.toString()}`);
    },
    getById: (id: number) => request<MemberDetail>(`/member/${id}`),
    create: (data: MemberCreatePayload) =>
      request<Member>('/member', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: MemberUpdatePayload) =>
      request<Member>(`/member/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/member/${id}`, {
        method: 'DELETE',
      }),
    renew: (id: number, data: MemberRenewPayload) =>
      request<Member>(`/member/${id}/renew`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getExpired: () => request<Member[]>('/member/expired'),
    getExpiringSoon: () => request<Member[]>('/member/expiring-soon'),
  },

  // Trainers
  trainers: {
    getAll: (params?: { search?: string; activeOnly?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.activeOnly !== undefined) query.append('activeOnly', params.activeOnly.toString());
      return request<Trainer[]>(`/trainer?${query.toString()}`);
    },
    getById: (id: number) => request<TrainerDetail>(`/trainer/${id}`),
    create: (data: TrainerCreatePayload) =>
      request<Trainer>('/trainer', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: TrainerUpdatePayload) =>
      request<Trainer>(`/trainer/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/trainer/${id}`, {
        method: 'DELETE',
      }),
    toggleActive: (id: number) =>
      request<Trainer>(`/trainer/${id}/toggle-active`, {
        method: 'PATCH',
      }),
  },

  // Membership Plans
  plans: {
    getAll: (params?: { activeOnly?: boolean; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.activeOnly !== undefined) query.append('activeOnly', params.activeOnly.toString());
      if (params?.search) query.append('search', params.search);
      return request<MembershipPlan[]>(`/membershipplan?${query.toString()}`);
    },
    getById: (id: number) => request<MembershipPlan>(`/membershipplan/${id}`),
    create: (data: MembershipPlanCreatePayload) =>
      request<MembershipPlan>('/membershipplan', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: MembershipPlanUpdatePayload) =>
      request<MembershipPlan>(`/membershipplan/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/membershipplan/${id}`, {
        method: 'DELETE',
      }),
    toggleActive: (id: number) =>
      request<MembershipPlan>(`/membershipplan/${id}/toggle-active`, {
        method: 'PATCH',
      }),
  },

  // Workouts
  workouts: {
    getAll: (params?: { search?: string; difficulty?: string; trainerId?: number }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.difficulty && params.difficulty !== 'ALL') query.append('difficulty', params.difficulty);
      if (params?.trainerId) query.append('trainerId', params.trainerId.toString());
      return request<Workout[]>(`/workout?${query.toString()}`);
    },
    getById: (id: number) => request<Workout>(`/workout/${id}`),
    create: (data: WorkoutCreatePayload) =>
      request<Workout>('/workout', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: WorkoutUpdatePayload) =>
      request<Workout>(`/workout/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/workout/${id}`, {
        method: 'DELETE',
      }),
    getByTrainer: (trainerId: number) => request<Workout[]>(`/workout/by-trainer/${trainerId}`),
  },

  // Payments
  payments: {
    getAll: (params?: { search?: string; memberId?: number; paymentMethod?: string; fromDate?: string; toDate?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.memberId) query.append('memberId', params.memberId.toString());
      if (params?.paymentMethod && params.paymentMethod !== 'ALL') query.append('paymentMethod', params.paymentMethod);
      if (params?.fromDate) query.append('fromDate', params.fromDate);
      if (params?.toDate) query.append('toDate', params.toDate);
      return request<Payment[]>(`/payment?${query.toString()}`);
    },
    getById: (id: number) => request<Payment>(`/payment/${id}`),
    pay: (data: PaymentCreatePayload) =>
      request<Payment>('/payment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getByMember: (memberId: number) => request<Payment[]>(`/payment/by-member/${memberId}`),
    getStats: () => request<{ totalRevenue: number; monthlyRevenue: number }>('/payment/stats'),
  },

  // Dashboard
  dashboard: {
    getSummary: () => request<DashboardSummary>('/dashboard/summary'),
  },

  // Reports
  reports: {
    getRevenue: (params?: { fromDate?: string; toDate?: string }) => {
      const query = new URLSearchParams();
      if (params?.fromDate) query.append('fromDate', params.fromDate);
      if (params?.toDate) query.append('toDate', params.toDate);
      return request<RevenueReport>(`/reports/revenue?${query.toString()}`);
    },
    getGrowth: (months = 6) => request<MemberGrowthReport>(`/reports/growth?months=${months}`),
    getTrainers: () => request<TrainerReportItem[]>('/reports/trainers'),
    getExpiredMembers: () => request<Member[]>('/reports/expired-members'),
  },

  // Search
  search: {
    global: (q: string) => request<GlobalSearchResult>(`/search?q=${encodeURIComponent(q)}`),
  },

  // Notifications
  notifications: {
    getRecent: (count = 10) => request<NotificationItem[]>(`/notification?count=${count}`),
    getUnreadCount: () => request<{ unreadCount: number }>('/notification/unread-count'),
    markAllRead: () =>
      request<{ message: string }>('/notification/mark-all-read', {
        method: 'POST',
      }),
    markRead: (id: number) =>
      request<{ message: string }>(`/notification/${id}/read`, {
        method: 'PATCH',
      }),
  },
};
