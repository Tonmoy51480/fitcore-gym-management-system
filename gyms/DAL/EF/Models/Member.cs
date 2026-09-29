using System;
using System.Collections.Generic;

namespace DAL.EF.Models
{
    public class Member
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? EmergencyContact { get; set; }
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;
        public DateTime ExpiryDate { get; set; } = DateTime.UtcNow.AddMonths(1);
        public string Status { get; set; } = "Active"; // Active, Expired, Expiring Soon, Inactive

        public int? MembershipPlanId { get; set; }
        public MembershipPlan? MembershipPlan { get; set; }

        public int? AssignedTrainerId { get; set; }
        public Trainer? AssignedTrainer { get; set; }

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
