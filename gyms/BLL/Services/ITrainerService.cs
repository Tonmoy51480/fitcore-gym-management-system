using BLL.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface ITrainerService
    {
        Task<TrainerResponseDTO> CreateAsync(TrainerCreateDTO dto);
        Task<List<TrainerResponseDTO>> GetAllAsync(string? search = null, bool? activeOnly = null);
        Task<TrainerDetailResponseDTO?> GetByIdAsync(int id);
        Task<TrainerResponseDTO?> UpdateAsync(int id, TrainerUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<TrainerResponseDTO?> ToggleActiveAsync(int id);
        Task<List<TrainerResponseDTO>> GetActiveAsync();

        // Legacy compatibility
        void Create(TrainerCreateDTO dto);
        List<TrainerResponseDTO> GetAll();
        List<TrainerResponseDTO> GetActive();
        void Deactivate(int id);
    }
}
