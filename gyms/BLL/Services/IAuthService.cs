using BLL.DTOs;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDTO> LoginAsync(LoginRequestDTO dto, string jwtKey, string jwtIssuer, string jwtAudience);
        Task<UserProfileDTO> RegisterAsync(RegisterRequestDTO dto);
        Task<UserProfileDTO?> GetCurrentUserAsync(int userId);
        Task<UserProfileDTO?> UpdateProfileAsync(int userId, UpdateProfileDTO dto);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto);
        Task SeedInitialUsersAsync();
    }
}
