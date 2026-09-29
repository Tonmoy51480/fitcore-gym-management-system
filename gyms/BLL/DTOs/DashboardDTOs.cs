using System;
using System.Collections.Generic;

namespace BLL.DTOs
{
    public class MonthlyRevenuePointDTO
    {
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        public int MonthNumber { get; set; }
        public decimal Revenue { get; set; }
        public int NewMembers { get; set; }
    }

    public class PlanDistributionDTO
    {
        public string PlanName { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class StatusBreakdownDTO
    {
        public int Active { get; set; }
        public int Expired { get; set; }
        public int ExpiringSoon { get; set; }
        public int Inactive { get; set; }
    }

    public class DashboardSummaryDTO
    {
        public int TotalMembers { get; set; }
        public int ActiveMembers { get; set; }
        public int ExpiredMembers { get; set; }
        public int ExpiringSoonMembers { get; set; }
        public int TotalTrainers { get; set; }
        public int ActiveTrainers { get; set; }
        public int TotalPlans { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal CurrentMonthRevenue { get; set; }

        public StatusBreakdownDTO StatusBreakdown { get; set; } = new StatusBreakdownDTO();
        public List<MonthlyRevenuePointDTO> RevenueHistory { get; set; } = new List<MonthlyRevenuePointDTO>();
        public List<PlanDistributionDTO> PlanDistribution { get; set; } = new List<PlanDistributionDTO>();
        public List<MemberResponseDTO> RecentMembers { get; set; } = new List<MemberResponseDTO>();
        public List<PaymentResponseDTO> RecentPayments { get; set; } = new List<PaymentResponseDTO>();
        public List<MemberResponseDTO> UpcomingExpirations { get; set; } = new List<MemberResponseDTO>();
        public List<TrainerResponseDTO> ActiveTrainersList { get; set; } = new List<TrainerResponseDTO>();
    }
}
