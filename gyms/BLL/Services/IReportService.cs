using BLL.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface IReportService
    {
        Task<RevenueReportDTO> GetRevenueReportAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<MemberGrowthReportDTO> GetMemberGrowthReportAsync(int months = 6);
        Task<List<TrainerReportItemDTO>> GetTrainerReportAsync();
        Task<List<MemberResponseDTO>> GetExpiredMembersReportAsync();
    }
}
