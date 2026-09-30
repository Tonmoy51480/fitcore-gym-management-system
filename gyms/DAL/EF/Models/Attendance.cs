using System;

namespace DAL.EF.Models
{
    public class Attendance
    {
        public int Id { get; set; }

        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;

        public DateTime CheckInTime { get; set; } = DateTime.UtcNow;
        public DateTime? CheckOutTime { get; set; }

        public string? Notes { get; set; }
    }
}
