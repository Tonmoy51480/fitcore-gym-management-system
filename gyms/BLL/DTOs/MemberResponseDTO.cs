using System;
using System.Collections.Generic;

namespace BLL.DTOs
{
    public class MemberResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? EmergencyContact { get; set; }
        public DateTime JoinDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = string.Empty; // Active, Expired, Expiring Soon, Inactive
        public int? MembershipPlanId { get; set; }
        public string? MembershipPlanName { get; set; }
        public int? AssignedTrainerId { get; set; }
        public string? AssignedTrainerName { get; set; }
        public decimal TotalPaid { get; set; }
        public int DaysRemaining { get; set; }
    }

    public class MemberDetailResponseDTO : MemberResponseDTO
    {
        public List<PaymentResponseDTO> Payments { get; set; } = new List<PaymentResponseDTO>();
    }
}
