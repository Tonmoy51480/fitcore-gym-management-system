using System;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTOs
{
    public class WorkoutCreateDTO
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Title must be between 2 and 100 characters")]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(5, 360, ErrorMessage = "Duration must be between 5 and 360 minutes")]
        public int DurationMinutes { get; set; }

        [Required(ErrorMessage = "Difficulty level is required")]
        public string Difficulty { get; set; } = "Beginner"; // Beginner, Intermediate, Advanced

        [Range(0, 5000, ErrorMessage = "Calories must be positive")]
        public int CaloriesBurned { get; set; }

        public string? TargetMuscle { get; set; }

        [Required(ErrorMessage = "Trainer is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Valid trainer ID is required")]
        public int TrainerId { get; set; }
    }

    public class WorkoutUpdateDTO
    {
        [Required(ErrorMessage = "Title is required")]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(5, 360, ErrorMessage = "Duration must be between 5 and 360 minutes")]
        public int DurationMinutes { get; set; }

        [Required(ErrorMessage = "Difficulty level is required")]
        public string Difficulty { get; set; } = "Beginner";

        [Range(0, 5000, ErrorMessage = "Calories must be positive")]
        public int CaloriesBurned { get; set; }

        public string? TargetMuscle { get; set; }

        [Required(ErrorMessage = "Trainer is required")]
        public int TrainerId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
