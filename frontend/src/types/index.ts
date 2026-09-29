export type UserRole = 'ADMIN' | 'STAFF' | 'TRAINER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  joinDate: string;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Inactive';
  membershipPlanId?: number;
  membershipPlanName?: string;
  assignedTrainerId?: number;
  assignedTrainerName?: string;
  totalPaid: number;
  daysRemaining: number;
}

export interface MemberDetail extends Member {
  payments: Payment[];
}

export interface MemberCreatePayload {
  name: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  membershipPlanId?: number;
  planMonths: number;
  assignedTrainerId?: number;
  initialPaymentAmount?: number;
  paymentMethod?: string;
}

export interface MemberUpdatePayload {
  name: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  membershipPlanId?: number;
  assignedTrainerId?: number;
  status?: string;
}

export interface MemberRenewPayload {
  membershipPlanId?: number;
  additionalMonths: number;
  paymentAmount: number;
  paymentMethod: string;
  notes?: string;
}

export interface Trainer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  specialty: string;
  experienceYears: number;
  isActive: boolean;
  createdAt: string;
  workoutCount: number;
  memberCount: number;
}

export interface TrainerDetail extends Trainer {
  workouts: Workout[];
  assignedMembers: Member[];
}

export interface TrainerCreatePayload {
  name: string;
  email?: string;
  phone?: string;
  specialty: string;
  experienceYears: number;
}

export interface TrainerUpdatePayload extends TrainerCreatePayload {
  isActive: boolean;
}

export interface MembershipPlan {
  id: number;
  planName: string;
  description?: string;
  price: number;
  durationMonths: number;
  isActive: boolean;
  activeMembersCount: number;
}

export interface MembershipPlanCreatePayload {
  planName: string;
  description?: string;
  price: number;
  durationMonths: number;
}

export interface MembershipPlanUpdatePayload extends MembershipPlanCreatePayload {
  isActive: boolean;
}

export interface Workout {
  id: number;
  title: string;
  description?: string;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  caloriesBurned: number;
  targetMuscle?: string;
  isActive: boolean;
  trainerId: number;
  trainerName: string;
}

export interface WorkoutCreatePayload {
  title: string;
  description?: string;
  durationMinutes: number;
  difficulty: string;
  caloriesBurned: number;
  targetMuscle?: string;
  trainerId: number;
}

export interface WorkoutUpdatePayload extends WorkoutCreatePayload {
  isActive: boolean;
}

export interface Payment {
  id: number;
  memberId: number;
  memberName: string;
  memberEmail: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface PaymentCreatePayload {
  memberId: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface MonthlyRevenuePoint {
  month: string;
  year: number;
  monthNumber: number;
  revenue: number;
  newMembers: number;
}

export interface PlanDistribution {
  planName: string;
  memberCount: number;
  percentage: number;
}

export interface StatusBreakdown {
  active: number;
  expired: number;
  expiringSoon: number;
  inactive: number;
}

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  expiringSoonMembers: number;
  totalTrainers: number;
  activeTrainers: number;
  totalPlans: number;
  totalRevenue: number;
  currentMonthRevenue: number;
  statusBreakdown: StatusBreakdown;
  revenueHistory: MonthlyRevenuePoint[];
  planDistribution: PlanDistribution[];
  recentMembers: Member[];
  recentPayments: Payment[];
  upcomingExpirations: Member[];
  activeTrainersList: Trainer[];
}

export interface RevenueReportItem {
  period: string;
  totalAmount: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface RevenueReport {
  totalRevenue: number;
  totalTransactions: number;
  averagePayment: number;
  monthlyBreakdown: RevenueReportItem[];
  methodBreakdown: Record<string, number>;
}

export interface MemberGrowthPoint {
  month: string;
  joined: number;
  expired: number;
}

export interface MemberGrowthReport {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  monthlyGrowth: MemberGrowthPoint[];
}

export interface TrainerReportItem {
  trainerId: number;
  trainerName: string;
  specialty: string;
  assignedMembersCount: number;
  totalWorkoutsCount: number;
  isActive: boolean;
}

export interface GlobalSearchResult {
  members: Member[];
  trainers: Trainer[];
  plans: MembershipPlan[];
  workouts: Workout[];
  payments: Payment[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  createdAt: string;
  isRead: boolean;
}
