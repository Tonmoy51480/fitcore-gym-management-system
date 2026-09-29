using System;
using System.Collections.Generic;

namespace DAL.EF.Models
{
    public class Trainer
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string Specialty { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
        public ICollection<Member> Members { get; set; } = new List<Member>();
    }
}
