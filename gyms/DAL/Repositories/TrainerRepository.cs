using DAL.EF;
using DAL.EF.Models;
using DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class TrainerRepository : GenericRepository<Trainer>, ITrainerRepository
    {
        public TrainerRepository(ApplicationDbContext db) : base(db) { }

        public async Task<List<Trainer>> GetAllWithDetailsAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(t => t.Workouts)
                .Include(t => t.Members)
                .OrderByDescending(t => t.Id)
                .ToListAsync();
        }

        public async Task<Trainer?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(t => t.Workouts)
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<Trainer>> GetActiveTrainersAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(t => t.Workouts)
                .Include(t => t.Members)
                .Where(t => t.IsActive)
                .ToListAsync();
        }

        // Legacy synchronous
        public List<Trainer> GetActiveTrainers()
        {
            return _dbSet.Where(t => t.IsActive).ToList();
        }
    }
}
