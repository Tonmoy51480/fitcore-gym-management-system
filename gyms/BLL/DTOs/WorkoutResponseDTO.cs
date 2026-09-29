using System;

namespace BLL.DTOs
{
    public class WorkoutResponseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DurationMinutes { get; set; }
        public string Difficulty { get; set; } = string.Empty;
        public int CaloriesBurned { get; set; }
        public string? TargetMuscle { get; set; }
        public bool IsActive { get; set; }
        public int TrainerId { get; set; }
        public string TrainerName { get; set; } = string.Empty;
    }
}
