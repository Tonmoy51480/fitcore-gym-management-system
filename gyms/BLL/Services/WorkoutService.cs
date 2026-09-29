using BLL.DTOs;
using DAL.EF.Models;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class WorkoutService : IWorkoutService
    {
        private readonly IWorkoutRepository _repo;
        private readonly ITrainerRepository _trainerRepo;

        public WorkoutService(IWorkoutRepository repo, ITrainerRepository trainerRepo)
        {
            _repo = repo;
            _trainerRepo = trainerRepo;
        }

        private static WorkoutResponseDTO MapToResponse(Workout w)
        {
            return new WorkoutResponseDTO
            {
                Id = w.Id,
                Title = w.Title,
                Description = w.Description,
                DurationMinutes = w.DurationMinutes,
                Difficulty = w.Difficulty,
                CaloriesBurned = w.CaloriesBurned,
                TargetMuscle = w.TargetMuscle,
                IsActive = w.IsActive,
                TrainerId = w.TrainerId,
                TrainerName = w.Trainer?.Name ?? "Unassigned"
            };
        }

        public async Task<WorkoutResponseDTO> CreateAsync(WorkoutCreateDTO dto)
        {
            var trainer = await _trainerRepo.GetByIdAsync(dto.TrainerId);
            if (trainer == null)
            {
                throw new ArgumentException($"Trainer with ID {dto.TrainerId} not found");
            }

            var workout = new Workout
            {
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                DurationMinutes = dto.DurationMinutes,
                Difficulty = dto.Difficulty,
                CaloriesBurned = dto.CaloriesBurned,
                TargetMuscle = dto.TargetMuscle?.Trim(),
                TrainerId = dto.TrainerId,
                IsActive = true
            };

            await _repo.AddAsync(workout);

            var created = await _repo.GetByIdWithTrainerAsync(workout.Id);
            return MapToResponse(created ?? workout);
        }

        public async Task<List<WorkoutResponseDTO>> GetAllAsync(string? search = null, string? difficulty = null, int? trainerId = null)
        {
            var workouts = await _repo.GetAllWithTrainerAsync();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var query = search.Trim().ToLower();
                workouts = workouts.Where(w =>
                    (w.Title != null && w.Title.ToLower().Contains(query)) ||
                    (w.TargetMuscle != null && w.TargetMuscle.ToLower().Contains(query)) ||
                    (w.Description != null && w.Description.ToLower().Contains(query)) ||
                    (w.Trainer != null && w.Trainer.Name.ToLower().Contains(query))
                ).ToList();
            }

            if (!string.IsNullOrWhiteSpace(difficulty))
            {
                workouts = workouts.Where(w => string.Equals(w.Difficulty, difficulty, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (trainerId.HasValue && trainerId.Value > 0)
            {
                workouts = workouts.Where(w => w.TrainerId == trainerId.Value).ToList();
            }

            return workouts.Select(MapToResponse).ToList();
        }

        public async Task<WorkoutResponseDTO?> GetByIdAsync(int id)
        {
            var workout = await _repo.GetByIdWithTrainerAsync(id);
            if (workout == null) return null;
            return MapToResponse(workout);
        }

        public async Task<WorkoutResponseDTO?> UpdateAsync(int id, WorkoutUpdateDTO dto)
        {
            var workout = await _repo.GetByIdWithTrainerAsync(id);
            if (workout == null) return null;

            var trainer = await _trainerRepo.GetByIdAsync(dto.TrainerId);
            if (trainer == null)
            {
                throw new ArgumentException($"Trainer with ID {dto.TrainerId} not found");
            }

            workout.Title = dto.Title.Trim();
            workout.Description = dto.Description?.Trim();
            workout.DurationMinutes = dto.DurationMinutes;
            workout.Difficulty = dto.Difficulty;
            workout.CaloriesBurned = dto.CaloriesBurned;
            workout.TargetMuscle = dto.TargetMuscle?.Trim();
            workout.TrainerId = dto.TrainerId;
            workout.IsActive = dto.IsActive;

            await _repo.UpdateAsync(workout);

            var updated = await _repo.GetByIdWithTrainerAsync(id);
            return MapToResponse(updated ?? workout);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var workout = await _repo.GetByIdAsync(id);
            if (workout == null) return false;

            await _repo.DeleteAsync(id);
            return true;
        }

        public async Task<List<WorkoutResponseDTO>> GetByTrainerAsync(int trainerId)
        {
            var workouts = await _repo.GetByTrainerAsync(trainerId);
            return workouts.Select(MapToResponse).ToList();
        }

        public async Task<List<WorkoutResponseDTO>> FilterAsync(string difficulty)
        {
            var workouts = await _repo.FilterByDifficultyAsync(difficulty);
            return workouts.Select(MapToResponse).ToList();
        }

        // Legacy compatibility
        public void Create(WorkoutCreateDTO dto)
        {
            CreateAsync(dto).GetAwaiter().GetResult();
        }

        public List<WorkoutResponseDTO> GetByTrainer(int trainerId)
        {
            return GetByTrainerAsync(trainerId).GetAwaiter().GetResult();
        }

        public List<WorkoutResponseDTO> Filter(string difficulty)
        {
            return FilterAsync(difficulty).GetAwaiter().GetResult();
        }
    }
}
