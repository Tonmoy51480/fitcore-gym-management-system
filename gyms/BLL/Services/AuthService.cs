using BLL.DTOs;
using DAL.EF.Models;
using DAL.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;

        public AuthService(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task<LoginResponseDTO> LoginAsync(LoginRequestDTO dto, string jwtKey, string jwtIssuer, string jwtAudience)
        {
            var user = await _userRepo.GetByUsernameOrEmailAsync(dto.UsernameOrEmail);
            if (user == null || !user.IsActive)
            {
                throw new UnauthorizedAccessException("Invalid credentials or account is inactive");
            }

            bool validPassword = false;
            try
            {
                validPassword = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            }
            catch
            {
                // Fallback check if plain text during migration/dev
                if (dto.Password == user.PasswordHash)
                {
                    validPassword = true;
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                    await _userRepo.UpdateAsync(user);
                }
            }

            if (!validPassword)
            {
                throw new UnauthorizedAccessException("Invalid credentials or account is inactive");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(jwtKey);
            var expires = dto.RememberMe ? DateTime.UtcNow.AddDays(30) : DateTime.UtcNow.AddHours(12);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expires,
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return new LoginResponseDTO
            {
                Token = tokenHandler.WriteToken(token),
                ExpiresAt = expires,
                User = new UserProfileDTO
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role,
                    FullName = user.FullName,
                    Phone = user.Phone,
                    AvatarUrl = user.AvatarUrl
                }
            };
        }

        public async Task<UserProfileDTO> RegisterAsync(RegisterRequestDTO dto)
        {
            var existingUser = await _userRepo.GetByUsernameAsync(dto.Username.Trim());
            if (existingUser != null)
                throw new ArgumentException("Username is already taken");

            var existingEmail = await _userRepo.GetByEmailAsync(dto.Email.Trim().ToLower());
            if (existingEmail != null)
                throw new ArgumentException("Email is already registered");

            var role = dto.Role?.ToUpper() switch
            {
                "ADMIN" => "ADMIN",
                "TRAINER" => "TRAINER",
                _ => "STAFF"
            };

            var user = new User
            {
                Username = dto.Username.Trim(),
                Email = dto.Email.Trim().ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName.Trim(),
                Phone = dto.Phone?.Trim(),
                Role = role,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _userRepo.AddAsync(user);

            return new UserProfileDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                FullName = user.FullName,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl
            };
        }

        public async Task<UserProfileDTO?> GetCurrentUserAsync(int userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return null;

            return new UserProfileDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                FullName = user.FullName,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl
            };
        }

        public async Task<UserProfileDTO?> UpdateProfileAsync(int userId, UpdateProfileDTO dto)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email.ToLower() != user.Email.ToLower())
            {
                var existing = await _userRepo.GetByEmailAsync(dto.Email);
                if (existing != null && existing.Id != userId)
                {
                    throw new ArgumentException("Email is already in use by another account");
                }
                user.Email = dto.Email.Trim().ToLower();
            }

            user.FullName = dto.FullName.Trim();
            user.Phone = dto.Phone?.Trim();
            if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            {
                user.AvatarUrl = dto.AvatarUrl.Trim();
            }

            await _userRepo.UpdateAsync(user);

            return new UserProfileDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                FullName = user.FullName,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return false;

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Current password is incorrect");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _userRepo.UpdateAsync(user);
            return true;
        }

        public async Task SeedInitialUsersAsync()
        {
            var adminUser = await _userRepo.GetByUsernameAsync("admin");
            if (adminUser == null)
            {
                await _userRepo.AddAsync(new User
                {
                    Username = "admin",
                    Email = "admin@gymfitness.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "ADMIN",
                    FullName = "System Administrator",
                    Phone = "+1 555-0199",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }

            var staffUser = await _userRepo.GetByUsernameAsync("staff");
            if (staffUser == null)
            {
                await _userRepo.AddAsync(new User
                {
                    Username = "staff",
                    Email = "staff@gymfitness.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
                    Role = "STAFF",
                    FullName = "Front Desk Staff",
                    Phone = "+1 555-0144",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }

            var trainerUser = await _userRepo.GetByUsernameAsync("trainer");
            if (trainerUser == null)
            {
                await _userRepo.AddAsync(new User
                {
                    Username = "trainer",
                    Email = "trainer@gymfitness.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Trainer@123"),
                    Role = "TRAINER",
                    FullName = "Alex Stone (Trainer)",
                    Phone = "+1 555-0188",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }
        }
    }
}
