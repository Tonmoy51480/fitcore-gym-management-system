using System;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTOs
{
    public class MembershipPlanCreateDTO
    {
        [Required(ErrorMessage = "Plan name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Plan name must be between 2 and 100 characters")]
        public string PlanName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(0.01, 100000, ErrorMessage = "Price must be greater than zero")]
        public decimal Price { get; set; }

        [Range(1, 120, ErrorMessage = "Duration months must be between 1 and 120")]
        public int DurationMonths { get; set; } = 1;
    }

    public class MembershipPlanUpdateDTO
    {
        [Required(ErrorMessage = "Plan name is required")]
        public string PlanName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(0.01, 100000, ErrorMessage = "Price must be greater than zero")]
        public decimal Price { get; set; }

        [Range(1, 120, ErrorMessage = "Duration months must be between 1 and 120")]
        public int DurationMonths { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class MembershipPlanResponseDTO
    {
        public int Id { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationMonths { get; set; }
        public bool IsActive { get; set; }
        public int ActiveMembersCount { get; set; }
    }
}
