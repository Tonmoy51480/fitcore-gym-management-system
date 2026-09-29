using System;
using System.Collections.Generic;

namespace BLL.DTOs
{
    public class TrainerResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Specialty { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int WorkoutCount { get; set; }
        public int MemberCount { get; set; }
    }

    public class TrainerDetailResponseDTO : TrainerResponseDTO
    {
        public List<WorkoutResponseDTO> Workouts { get; set; } = new List<WorkoutResponseDTO>();
        public List<MemberResponseDTO> AssignedMembers { get; set; } = new List<MemberResponseDTO>();
    }
}
