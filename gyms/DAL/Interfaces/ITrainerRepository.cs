using DAL.EF.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface ITrainerRepository : IGenericRepository<Trainer>
    {
        Task<List<Trainer>> GetAllWithDetailsAsync();
        Task<Trainer?> GetByIdWithDetailsAsync(int id);
        Task<List<Trainer>> GetActiveTrainersAsync();

        // Legacy synchronous
        List<Trainer> GetActiveTrainers();
    }
}
