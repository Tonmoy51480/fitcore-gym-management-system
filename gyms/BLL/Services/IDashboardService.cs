using BLL.DTOs;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDTO> GetSummaryAsync();
    }
}
