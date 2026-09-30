using BLL.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface IMemberService
    {
        Task<MemberResponseDTO> CreateAsync(MemberCreateDTO dto);
        Task<List<MemberResponseDTO>> GetAllAsync(string? search = null, string? status = null, int? planId = null);
        Task<PagedResult<MemberResponseDTO>> GetPagedAsync(int pageNumber, int pageSize, string? search = null, string? status = null, int? planId = null);
        Task<MemberDetailResponseDTO?> GetByIdAsync(int id);
        Task<MemberResponseDTO?> UpdateAsync(int id, MemberUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<MemberResponseDTO?> RenewAsync(int id, MemberRenewDTO dto);
        Task<List<MemberResponseDTO>> GetExpiredAsync();
        Task<List<MemberResponseDTO>> GetExpiringSoonAsync();

        // Legacy compatibility
        void Create(MemberCreateDTO dto);
        List<MemberResponseDTO> GetAll();
        List<MemberResponseDTO> GetExpired();
    }
}
