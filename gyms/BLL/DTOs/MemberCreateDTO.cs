using System;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTOs
{
    public class MemberCreateDTO
    {
        [Required(ErrorMessage = "Member name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Valid email address is required")]
        public string Email { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Invalid phone number")]
        public string? Phone { get; set; }

        public string? EmergencyContact { get; set; }

        public int? MembershipPlanId { get; set; }

        [Range(1, 120, ErrorMessage = "Plan duration must be between 1 and 120 months")]
        public int PlanMonths { get; set; } = 1;

        public int? AssignedTrainerId { get; set; }

        [Range(0, 100000, ErrorMessage = "Payment amount cannot be negative")]
        public decimal InitialPaymentAmount { get; set; } = 0;

        public string PaymentMethod { get; set; } = "Cash";
    }

    public class MemberUpdateDTO
    {
        [Required(ErrorMessage = "Member name is required")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Valid email address is required")]
        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }
        public string? EmergencyContact { get; set; }
        public int? MembershipPlanId { get; set; }
        public int? AssignedTrainerId { get; set; }
        public string Status { get; set; } = "Active";
    }

    public class MemberRenewDTO
    {
        public int? MembershipPlanId { get; set; }

        [Range(1, 60, ErrorMessage = "Additional months must be at least 1")]
        public int AdditionalMonths { get; set; } = 1;

        [Range(0.01, 100000, ErrorMessage = "Payment amount must be greater than 0")]
        public decimal PaymentAmount { get; set; }

        public string PaymentMethod { get; set; } = "Cash";
        public string? Notes { get; set; }
    }
}
