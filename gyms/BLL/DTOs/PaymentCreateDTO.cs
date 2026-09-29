using System;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTOs
{
    public class PaymentCreateDTO
    {
        [Required(ErrorMessage = "Member is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Valid member ID is required")]
        public int MemberId { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, 100000, ErrorMessage = "Payment amount must be greater than zero")]
        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Mobile Banking, Bank Transfer
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
    }

    public class PaymentResponseDTO
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public string MemberEmail { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
    }
}
