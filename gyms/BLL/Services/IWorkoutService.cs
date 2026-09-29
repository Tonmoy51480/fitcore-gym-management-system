using BLL.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface IWorkoutService
    {
        Task<WorkoutResponseDTO> CreateAsync(WorkoutCreateDTO dto);
        Task<List<WorkoutResponseDTO>> GetAllAsync(string? search = null, string? difficulty = null, int? trainerId = null);
        Task<WorkoutResponseDTO?> GetByIdAsync(int id);
        Task<WorkoutResponseDTO?> UpdateAsync(int id, WorkoutUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<List<WorkoutResponseDTO>> GetByTrainerAsync(int trainerId);
        Task<List<WorkoutResponseDTO>> FilterAsync(string difficulty);

        // Legacy compatibility
        void Create(WorkoutCreateDTO dto);
        List<WorkoutResponseDTO> GetByTrainer(int trainerId);
        List<WorkoutResponseDTO> Filter(string difficulty);
    }
}
