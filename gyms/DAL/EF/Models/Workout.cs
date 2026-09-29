using System;

namespace DAL.EF.Models
{
    public class Workout
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DurationMinutes { get; set; }
        public string Difficulty { get; set; } = "Beginner"; // Beginner, Intermediate, Advanced
        public int CaloriesBurned { get; set; }
        public string? TargetMuscle { get; set; }
        public bool IsActive { get; set; } = true;

        public int TrainerId { get; set; }
        public Trainer? Trainer { get; set; }
    }
}
