using BLL.DTOs;
using DAL.EF.Models;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IAttendanceRepository _attendanceRepository;
        private readonly IMemberRepository _memberRepository;

        public AttendanceService(
            IAttendanceRepository attendanceRepository,
            IMemberRepository memberRepository)
        {
            _attendanceRepository = attendanceRepository;
            _memberRepository = memberRepository;
        }

        public async Task<AttendanceResponseDTO> CheckInAsync(AttendanceCheckInDTO dto)
        {
            var member = await _memberRepository.GetByIdWithDetailsAsync(dto.MemberId);
            if (member == null)
            {
                throw new KeyNotFoundException($"Member with ID {dto.MemberId} was not found.");
            }

            // Verify membership status: cannot check in with expired membership
            if (member.ExpiryDate < DateTime.UtcNow)
            {
                throw new InvalidOperationException($"Cannot check in member '{member.Name}'. Membership expired on {member.ExpiryDate:yyyy-MM-dd}. Please renew membership first.");
            }

            // Check if already checked in
            var activeSession = await _attendanceRepository.GetActiveCheckInForMemberAsync(dto.MemberId);
            if (activeSession != null)
            {
                throw new InvalidOperationException($"Member '{member.Name}' is already checked in since {activeSession.CheckInTime:HH:mm}. Please check out first.");
            }

            var attendance = new Attendance
            {
                MemberId = dto.MemberId,
                CheckInTime = DateTime.UtcNow,
                Notes = dto.Notes
            };

            await _attendanceRepository.AddAsync(attendance);

            return MapToResponse(attendance, member);
        }

        public async Task<AttendanceResponseDTO> CheckOutAsync(int memberId, string? notes = null)
        {
            var member = await _memberRepository.GetByIdWithDetailsAsync(memberId);
            if (member == null)
            {
                throw new KeyNotFoundException($"Member with ID {memberId} was not found.");
            }

            var session = await _attendanceRepository.GetActiveCheckInForMemberAsync(memberId);
            if (session == null)
            {
                throw new InvalidOperationException($"Member '{member.Name}' has no active check-in session to check out from.");
            }

            session.CheckOutTime = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(notes))
            {
                session.Notes = string.IsNullOrWhiteSpace(session.Notes)
                    ? notes
                    : $"{session.Notes} | Checkout: {notes}";
            }

            await _attendanceRepository.UpdateAsync(session);

            return MapToResponse(session, member);
        }

        public async Task<List<AttendanceResponseDTO>> GetActiveCheckInsAsync()
        {
            var records = await _attendanceRepository.GetActiveCheckInsAsync();
            return records.Select(r => MapToResponse(r, r.Member)).ToList();
        }

        public async Task<List<AttendanceResponseDTO>> GetTodayAttendanceAsync()
        {
            var records = await _attendanceRepository.GetTodayAttendanceAsync();
            return records.Select(r => MapToResponse(r, r.Member)).ToList();
        }

        public async Task<List<AttendanceResponseDTO>> GetMemberHistoryAsync(int memberId, int limit = 50)
        {
            var member = await _memberRepository.GetByIdWithDetailsAsync(memberId);
            if (member == null)
            {
                throw new KeyNotFoundException($"Member with ID {memberId} was not found.");
            }

            var records = await _attendanceRepository.GetByMemberIdAsync(memberId, limit);
            return records.Select(r => MapToResponse(r, member)).ToList();
        }

        private static AttendanceResponseDTO MapToResponse(Attendance attendance, Member member)
        {
            return new AttendanceResponseDTO
            {
                Id = attendance.Id,
                MemberId = attendance.MemberId,
                MemberName = member?.Name ?? string.Empty,
                MemberEmail = member?.Email ?? string.Empty,
                MembershipPlanName = member?.MembershipPlan?.PlanName,
                CheckInTime = attendance.CheckInTime,
                CheckOutTime = attendance.CheckOutTime,
                Notes = attendance.Notes
            };
        }
    }
}
