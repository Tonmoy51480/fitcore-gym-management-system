using System;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTOs
{
    public class TrainerCreateDTO
    {
        [Required(ErrorMessage = "Trainer name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public string Name { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Invalid phone number")]
        public string? Phone { get; set; }

        [Required(ErrorMessage = "Specialty is required")]
        public string Specialty { get; set; } = string.Empty;

        [Range(0, 50, ErrorMessage = "Experience years must be between 0 and 50")]
        public int ExperienceYears { get; set; }
    }

    public class TrainerUpdateDTO
    {
        [Required(ErrorMessage = "Trainer name is required")]
        public string Name { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? Email { get; set; }

        public string? Phone { get; set; }

        [Required(ErrorMessage = "Specialty is required")]
        public string Specialty { get; set; } = string.Empty;

        [Range(0, 50, ErrorMessage = "Experience years must be between 0 and 50")]
        public int ExperienceYears { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
