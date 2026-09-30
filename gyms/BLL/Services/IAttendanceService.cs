using BLL.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface IAttendanceService
    {
        Task<AttendanceResponseDTO> CheckInAsync(AttendanceCheckInDTO dto);
        Task<AttendanceResponseDTO> CheckOutAsync(int memberId, string? notes = null);
        Task<List<AttendanceResponseDTO>> GetActiveCheckInsAsync();
        Task<List<AttendanceResponseDTO>> GetTodayAttendanceAsync();
        Task<List<AttendanceResponseDTO>> GetMemberHistoryAsync(int memberId, int limit = 50);
    }
}
