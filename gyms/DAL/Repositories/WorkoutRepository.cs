using DAL.EF;
using DAL.EF.Models;
using DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class WorkoutRepository : GenericRepository<Workout>, IWorkoutRepository
    {
        public WorkoutRepository(ApplicationDbContext db) : base(db) { }

        public async Task<List<Workout>> GetAllWithTrainerAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(w => w.Trainer)
                .OrderByDescending(w => w.Id)
                .ToListAsync();
        }

        public async Task<Workout?> GetByIdWithTrainerAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(w => w.Trainer)
                .FirstOrDefaultAsync(w => w.Id == id);
        }

        public async Task<List<Workout>> GetByTrainerAsync(int trainerId)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(w => w.Trainer)
                .Where(w => w.TrainerId == trainerId)
                .ToListAsync();
        }

        public async Task<List<Workout>> FilterByDifficultyAsync(string level)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(w => w.Trainer)
                .Where(w => w.Difficulty.ToLower() == level.ToLower())
                .ToListAsync();
        }

        // Legacy synchronous implementations
        public List<Workout> GetByTrainer(int trainerId)
        {
            return _dbSet.Where(w => w.TrainerId == trainerId).ToList();
        }

        public List<Workout> FilterByDifficulty(string level)
        {
            return _dbSet.Where(w => w.Difficulty == level).ToList();
        }
    }
}
