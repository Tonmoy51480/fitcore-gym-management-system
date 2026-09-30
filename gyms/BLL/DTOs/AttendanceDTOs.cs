using System;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTOs
{
    public class AttendanceCheckInDTO
    {
        [Required(ErrorMessage = "Member ID is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "A valid Member ID is required.")]
        public int MemberId { get; set; }

        [MaxLength(250, ErrorMessage = "Notes cannot exceed 250 characters.")]
        public string? Notes { get; set; }
    }

    public class AttendanceCheckOutDTO
    {
        [Required(ErrorMessage = "Member ID is required.")]
        public int MemberId { get; set; }

        [MaxLength(250, ErrorMessage = "Notes cannot exceed 250 characters.")]
        public string? Notes { get; set; }
    }

    public class AttendanceResponseDTO
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public string MemberEmail { get; set; } = string.Empty;
        public string? MembershipPlanName { get; set; }
        public DateTime CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public int? DurationMinutes => CheckOutTime.HasValue 
            ? (int)Math.Round((CheckOutTime.Value - CheckInTime).TotalMinutes) 
            : null;
        public string? Notes { get; set; }
        public bool IsActive => CheckOutTime == null;
    }
}
