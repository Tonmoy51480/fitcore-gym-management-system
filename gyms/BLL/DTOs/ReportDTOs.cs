using System;
using System.Collections.Generic;

namespace BLL.DTOs
{
    public class RevenueReportItemDTO
    {
        public string Period { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int TransactionCount { get; set; }
        public decimal AverageTransaction { get; set; }
    }

    public class RevenueReportDTO
    {
        public decimal TotalRevenue { get; set; }
        public int TotalTransactions { get; set; }
        public decimal AveragePayment { get; set; }
        public List<RevenueReportItemDTO> MonthlyBreakdown { get; set; } = new List<RevenueReportItemDTO>();
        public Dictionary<string, decimal> MethodBreakdown { get; set; } = new Dictionary<string, decimal>();
    }

    public class MemberGrowthReportDTO
    {
        public int TotalMembers { get; set; }
        public int ActiveMembers { get; set; }
        public int ExpiredMembers { get; set; }
        public List<MonthlyGrowthPointDTO> MonthlyGrowth { get; set; } = new List<MonthlyGrowthPointDTO>();
    }

    public class MonthlyGrowthPointDTO
    {
        public string Month { get; set; } = string.Empty;
        public int Joined { get; set; }
        public int Expired { get; set; }
    }

    public class TrainerReportItemDTO
    {
        public int TrainerId { get; set; }
        public string TrainerName { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;
        public int AssignedMembersCount { get; set; }
        public int TotalWorkoutsCount { get; set; }
        public bool IsActive { get; set; }
    }

    public class GlobalSearchResultDTO
    {
        public List<MemberResponseDTO> Members { get; set; } = new List<MemberResponseDTO>();
        public List<TrainerResponseDTO> Trainers { get; set; } = new List<TrainerResponseDTO>();
        public List<MembershipPlanResponseDTO> Plans { get; set; } = new List<MembershipPlanResponseDTO>();
        public List<WorkoutResponseDTO> Workouts { get; set; } = new List<WorkoutResponseDTO>();
        public List<PaymentResponseDTO> Payments { get; set; } = new List<PaymentResponseDTO>();
    }

    public class NotificationResponseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "info";
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }
}
