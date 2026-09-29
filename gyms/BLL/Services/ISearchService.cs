using BLL.DTOs;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface ISearchService
    {
        Task<GlobalSearchResultDTO> SearchAsync(string query);
    }
}
