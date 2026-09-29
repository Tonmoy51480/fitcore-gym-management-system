using DAL.EF.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IWorkoutRepository : IGenericRepository<Workout>
    {
        Task<List<Workout>> GetAllWithTrainerAsync();
        Task<Workout?> GetByIdWithTrainerAsync(int id);
        Task<List<Workout>> GetByTrainerAsync(int trainerId);
        Task<List<Workout>> FilterByDifficultyAsync(string level);

        // Legacy synchronous
        List<Workout> GetByTrainer(int trainerId);
        List<Workout> FilterByDifficulty(string level);
    }
}
