using BLL.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface IMembershipPlanService
    {
        Task<MembershipPlanResponseDTO> CreateAsync(MembershipPlanCreateDTO dto);
        Task<List<MembershipPlanResponseDTO>> GetAllAsync(bool? activeOnly = null, string? search = null);
        Task<MembershipPlanResponseDTO?> GetByIdAsync(int id);
        Task<MembershipPlanResponseDTO?> UpdateAsync(int id, MembershipPlanUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<MembershipPlanResponseDTO?> ToggleActiveAsync(int id);
    }
}
