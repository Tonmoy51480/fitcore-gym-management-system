using DAL.EF;
using DAL.EF.Models;
using DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext db) : base(db) { }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            var trimmed = username.Trim();
            return await _dbSet.FirstOrDefaultAsync(u => u.Username == trimmed);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var trimmed = email.Trim().ToLower();
            return await _dbSet.FirstOrDefaultAsync(u => u.Email == trimmed);
        }

        public async Task<User?> GetByUsernameOrEmailAsync(string identifier)
        {
            var trimmed = identifier.Trim();
            var lower = trimmed.ToLower();
            return await _dbSet.FirstOrDefaultAsync(u => u.Username == trimmed || u.Email == lower);
        }
    }
}
