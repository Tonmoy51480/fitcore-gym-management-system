using BLL.DTOs;
using DAL.EF.Models;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class TrainerService : ITrainerService
    {
        private readonly ITrainerRepository _repo;
        private readonly INotificationRepository _notifRepo;

        public TrainerService(ITrainerRepository repo, INotificationRepository notifRepo)
        {
            _repo = repo;
            _notifRepo = notifRepo;
        }

        private TrainerResponseDTO MapToResponse(Trainer t)
        {
            return new TrainerResponseDTO
            {
                Id = t.Id,
                Name = t.Name,
                Email = t.Email,
                Phone = t.Phone,
                Specialty = t.Specialty,
                ExperienceYears = t.ExperienceYears,
                IsActive = t.IsActive,
                CreatedAt = t.CreatedAt,
                WorkoutCount = t.Workouts?.Count ?? 0,
                MemberCount = t.Members?.Count ?? 0
            };
        }

        public async Task<TrainerResponseDTO> CreateAsync(TrainerCreateDTO dto)
        {
            var trainer = new Trainer
            {
                Name = dto.Name.Trim(),
                Email = dto.Email?.Trim().ToLower(),
                Phone = dto.Phone?.Trim(),
                Specialty = dto.Specialty.Trim(),
                ExperienceYears = dto.ExperienceYears,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _repo.AddAsync(trainer);

            await _notifRepo.AddAsync(new Notification
            {
                Title = "Trainer Added",
                Message = $"Trainer {trainer.Name} ({trainer.Specialty}) has been added.",
                Type = "info",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                TargetRole = "ALL"
            });

            var created = await _repo.GetByIdWithDetailsAsync(trainer.Id);
            return MapToResponse(created ?? trainer);
        }

        public async Task<List<TrainerResponseDTO>> GetAllAsync(string? search = null, bool? activeOnly = null)
        {
            var trainers = await _repo.GetAllWithDetailsAsync();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var query = search.Trim().ToLower();
                trainers = trainers.Where(t =>
                    (t.Name != null && t.Name.ToLower().Contains(query)) ||
                    (t.Specialty != null && t.Specialty.ToLower().Contains(query)) ||
                    (t.Email != null && t.Email.ToLower().Contains(query)) ||
                    (t.Phone != null && t.Phone.Contains(query))
                ).ToList();
            }

            if (activeOnly.HasValue)
            {
                trainers = trainers.Where(t => t.IsActive == activeOnly.Value).ToList();
            }

            return trainers.Select(MapToResponse).ToList();
        }

        public async Task<TrainerDetailResponseDTO?> GetByIdAsync(int id)
        {
            var trainer = await _repo.GetByIdWithDetailsAsync(id);
            if (trainer == null) return null;

            var baseDto = MapToResponse(trainer);

            var workouts = (trainer.Workouts ?? new List<Workout>())
                .Select(w => new WorkoutResponseDTO
                {
                    Id = w.Id,
                    Title = w.Title,
                    Description = w.Description,
                    DurationMinutes = w.DurationMinutes,
                    Difficulty = w.Difficulty,
                    CaloriesBurned = w.CaloriesBurned,
                    TargetMuscle = w.TargetMuscle,
                    IsActive = w.IsActive,
                    TrainerId = trainer.Id,
                    TrainerName = trainer.Name
                }).ToList();

            var members = (trainer.Members ?? new List<Member>())
                .Select(m => new MemberResponseDTO
                {
                    Id = m.Id,
                    Name = m.Name,
                    Email = m.Email,
                    Phone = m.Phone,
                    JoinDate = m.JoinDate,
                    ExpiryDate = m.ExpiryDate,
                    Status = m.Status,
                    AssignedTrainerId = trainer.Id,
                    AssignedTrainerName = trainer.Name
                }).ToList();

            return new TrainerDetailResponseDTO
            {
                Id = baseDto.Id,
                Name = baseDto.Name,
                Email = baseDto.Email,
                Phone = baseDto.Phone,
                Specialty = baseDto.Specialty,
                ExperienceYears = baseDto.ExperienceYears,
                IsActive = baseDto.IsActive,
                CreatedAt = baseDto.CreatedAt,
                WorkoutCount = baseDto.WorkoutCount,
                MemberCount = baseDto.MemberCount,
                Workouts = workouts,
                AssignedMembers = members
            };
        }

        public async Task<TrainerResponseDTO?> UpdateAsync(int id, TrainerUpdateDTO dto)
        {
            var trainer = await _repo.GetByIdWithDetailsAsync(id);
            if (trainer == null) return null;

            trainer.Name = dto.Name.Trim();
            trainer.Email = dto.Email?.Trim().ToLower();
            trainer.Phone = dto.Phone?.Trim();
            trainer.Specialty = dto.Specialty.Trim();
            trainer.ExperienceYears = dto.ExperienceYears;
            trainer.IsActive = dto.IsActive;

            await _repo.UpdateAsync(trainer);

            var updated = await _repo.GetByIdWithDetailsAsync(id);
            return MapToResponse(updated ?? trainer);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var trainer = await _repo.GetByIdAsync(id);
            if (trainer == null) return false;

            await _repo.DeleteAsync(id);
            return true;
        }

        public async Task<TrainerResponseDTO?> ToggleActiveAsync(int id)
        {
            var trainer = await _repo.GetByIdWithDetailsAsync(id);
            if (trainer == null) return null;

            trainer.IsActive = !trainer.IsActive;
            await _repo.UpdateAsync(trainer);

            var updated = await _repo.GetByIdWithDetailsAsync(id);
            return MapToResponse(updated ?? trainer);
        }

        public async Task<List<TrainerResponseDTO>> GetActiveAsync()
        {
            var active = await _repo.GetActiveTrainersAsync();
            return active.Select(MapToResponse).ToList();
        }

        // Legacy compatibility
        public void Create(TrainerCreateDTO dto)
        {
            CreateAsync(dto).GetAwaiter().GetResult();
        }

        public List<TrainerResponseDTO> GetAll()
        {
            return GetAllAsync().GetAwaiter().GetResult();
        }

        public List<TrainerResponseDTO> GetActive()
        {
            return GetActiveAsync().GetAwaiter().GetResult();
        }

        public void Deactivate(int id)
        {
            var trainer = _repo.Get(id);
            if (trainer == null) return;
            trainer.IsActive = false;
            _repo.Update(trainer);
        }
    }
}
