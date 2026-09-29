using System;

namespace DAL.EF.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public Member? Member { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Mobile Banking, Bank Transfer
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
    }
}
