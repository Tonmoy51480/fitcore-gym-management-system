using DAL.EF;
using DAL.EF.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace gymandfitness.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(ApplicationDbContext context)
        {
            // Apply pending EF Core migrations
            await context.Database.MigrateAsync();

            // 1. Seed Users
            if (!await context.Users.AnyAsync())
            {
                var users = new List<User>
                {
                    new User
                    {
                        Username = "admin",
                        Email = "admin@gymfitness.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        Role = "ADMIN",
                        FullName = "System Administrator",
                        Phone = "+1 (555) 019-9001",
                        AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                        CreatedAt = DateTime.UtcNow.AddMonths(-6),
                        IsActive = true
                    },
                    new User
                    {
                        Username = "staff",
                        Email = "staff@gymfitness.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
                        Role = "STAFF",
                        FullName = "Jessica Miller (Staff)",
                        Phone = "+1 (555) 014-4002",
                        AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                        CreatedAt = DateTime.UtcNow.AddMonths(-4),
                        IsActive = true
                    },
                    new User
                    {
                        Username = "trainer",
                        Email = "trainer@gymfitness.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Trainer@123"),
                        Role = "TRAINER",
                        FullName = "Alex Stone (Trainer)",
                        Phone = "+1 (555) 018-8003",
                        AvatarUrl = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80",
                        CreatedAt = DateTime.UtcNow.AddMonths(-5),
                        IsActive = true
                    }
                };
                await context.Users.AddRangeAsync(users);
                await context.SaveChangesAsync();
            }

            // 2. Seed Membership Plans
            if (!await context.MembershipPlans.AnyAsync())
            {
                var plans = new List<MembershipPlan>
                {
                    new MembershipPlan
                    {
                        PlanName = "Starter Monthly",
                        Description = "Access to gym floor, cardio equipment, and locker rooms during standard hours.",
                        Price = 49.99m,
                        DurationMonths = 1,
                        IsActive = true
                    },
                    new MembershipPlan
                    {
                        PlanName = "Standard Quarterly",
                        Description = "Full gym access, free guest pass per month, and complimentary sauna access.",
                        Price = 129.99m,
                        DurationMonths = 3,
                        IsActive = true
                    },
                    new MembershipPlan
                    {
                        PlanName = "Pro Biannual",
                        Description = "All-inclusive access, unlimited group classes, and 2 monthly personal training sessions.",
                        Price = 249.99m,
                        DurationMonths = 6,
                        IsActive = true
                    },
                    new MembershipPlan
                    {
                        PlanName = "VIP Annual Elite",
                        Description = "24/7 VIP access, unlimited training sessions, nutrition planning, and private locker.",
                        Price = 459.99m,
                        DurationMonths = 12,
                        IsActive = true
                    }
                };
                await context.MembershipPlans.AddRangeAsync(plans);
                await context.SaveChangesAsync();
            }

            // 3. Seed Trainers
            if (!await context.Trainers.AnyAsync())
            {
                var trainers = new List<Trainer>
                {
                    new Trainer
                    {
                        Name = "Alex Stone",
                        Email = "alex.stone@gymfitness.com",
                        Phone = "+1 (555) 234-5678",
                        Specialty = "Strength & Conditioning",
                        ExperienceYears = 7,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddMonths(-12)
                    },
                    new Trainer
                    {
                        Name = "Sarah Jenkins",
                        Email = "sarah.j@gymfitness.com",
                        Phone = "+1 (555) 345-6789",
                        Specialty = "HIIT & Weight Loss",
                        ExperienceYears = 5,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddMonths(-10)
                    },
                    new Trainer
                    {
                        Name = "Marcus Vance",
                        Email = "marcus.v@gymfitness.com",
                        Phone = "+1 (555) 456-7890",
                        Specialty = "Bodybuilding & Hypertrophy",
                        ExperienceYears = 9,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddMonths(-8)
                    },
                    new Trainer
                    {
                        Name = "Elena Rostova",
                        Email = "elena.r@gymfitness.com",
                        Phone = "+1 (555) 567-8901",
                        Specialty = "Yoga & Mobility",
                        ExperienceYears = 6,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddMonths(-6)
                    }
                };
                await context.Trainers.AddRangeAsync(trainers);
                await context.SaveChangesAsync();
            }

            // 4. Seed Workouts
            if (!await context.Workouts.AnyAsync())
            {
                var trainers = await context.Trainers.ToListAsync();
                var t1 = trainers.ElementAtOrDefault(0)?.Id ?? 1;
                var t2 = trainers.ElementAtOrDefault(1)?.Id ?? 1;
                var t3 = trainers.ElementAtOrDefault(2)?.Id ?? 1;
                var t4 = trainers.ElementAtOrDefault(3)?.Id ?? 1;

                var workouts = new List<Workout>
                {
                    new Workout
                    {
                        Title = "Full Body Power Blast",
                        Description = "Compound multi-joint lifting session focusing on squat, bench, and deadlift mechanics.",
                        DurationMinutes = 60,
                        Difficulty = "Intermediate",
                        CaloriesBurned = 550,
                        TargetMuscle = "Full Body",
                        TrainerId = t1,
                        IsActive = true
                    },
                    new Workout
                    {
                        Title = "High-Intensity Fat Shredder",
                        Description = "Interval-based sprint and plyometric session designed for maximum cardiovascular output.",
                        DurationMinutes = 45,
                        Difficulty = "Advanced",
                        CaloriesBurned = 620,
                        TargetMuscle = "Cardiovascular & Core",
                        TrainerId = t2,
                        IsActive = true
                    },
                    new Workout
                    {
                        Title = "Hypertrophy Chest & Arms",
                        Description = "Isolated high-volume hypertrophy routine targeting pectoral thickness and biceps/triceps peak.",
                        DurationMinutes = 55,
                        Difficulty = "Intermediate",
                        CaloriesBurned = 450,
                        TargetMuscle = "Chest & Arms",
                        TrainerId = t3,
                        IsActive = true
                    },
                    new Workout
                    {
                        Title = "Foundational Mobility & Flow",
                        Description = "Dynamic spinal decompressions, hip openers, and restorative breathwork for recovery.",
                        DurationMinutes = 40,
                        Difficulty = "Beginner",
                        CaloriesBurned = 220,
                        TargetMuscle = "Hips, Spine & Shoulders",
                        TrainerId = t4,
                        IsActive = true
                    },
                    new Workout
                    {
                        Title = "Core Strength & Stability",
                        Description = "Targeted isometric holds and anti-rotation drills to build core stiffness and protect lower back.",
                        DurationMinutes = 35,
                        Difficulty = "Beginner",
                        CaloriesBurned = 280,
                        TargetMuscle = "Abdominals & Lower Back",
                        TrainerId = t2,
                        IsActive = true
                    }
                };
                await context.Workouts.AddRangeAsync(workouts);
                await context.SaveChangesAsync();
            }

            // 5. Seed Members & Payments
            if (!await context.Members.AnyAsync())
            {
                var plans = await context.MembershipPlans.ToListAsync();
                var trainers = await context.Trainers.ToListAsync();

                var pStarter = plans.FirstOrDefault(p => p.DurationMonths == 1);
                var pStandard = plans.FirstOrDefault(p => p.DurationMonths == 3);
                var pPro = plans.FirstOrDefault(p => p.DurationMonths == 6);
                var pVip = plans.FirstOrDefault(p => p.DurationMonths == 12);

                var t1 = trainers.ElementAtOrDefault(0)?.Id;
                var t2 = trainers.ElementAtOrDefault(1)?.Id;
                var t3 = trainers.ElementAtOrDefault(2)?.Id;

                var now = DateTime.UtcNow;

                var members = new List<Member>
                {
                    // Active members
                    new Member
                    {
                        Name = "Liam Gallagher",
                        Email = "liam.g@example.com",
                        Phone = "+1 (555) 890-1234",
                        EmergencyContact = "Noel Gallagher (+1 555-890-1235)",
                        JoinDate = now.AddMonths(-2),
                        ExpiryDate = now.AddMonths(4), // Active
                        Status = "Active",
                        MembershipPlanId = pPro?.Id,
                        AssignedTrainerId = t1
                    },
                    new Member
                    {
                        Name = "Sophia Martinez",
                        Email = "sophia.m@example.com",
                        Phone = "+1 (555) 901-2345",
                        EmergencyContact = "Carlos Martinez (+1 555-901-2346)",
                        JoinDate = now.AddMonths(-1),
                        ExpiryDate = now.AddMonths(2), // Active
                        Status = "Active",
                        MembershipPlanId = pStandard?.Id,
                        AssignedTrainerId = t2
                    },
                    new Member
                    {
                        Name = "David Chen",
                        Email = "david.chen@example.com",
                        Phone = "+1 (555) 012-3456",
                        EmergencyContact = "Grace Chen (+1 555-012-3457)",
                        JoinDate = now.AddMonths(-6),
                        ExpiryDate = now.AddMonths(6), // Active
                        Status = "Active",
                        MembershipPlanId = pVip?.Id,
                        AssignedTrainerId = t3
                    },
                    // Expiring soon (within 7 days)
                    new Member
                    {
                        Name = "Emma Watson",
                        Email = "emma.w@example.com",
                        Phone = "+1 (555) 123-4567",
                        EmergencyContact = "Robert Watson (+1 555-123-4568)",
                        JoinDate = now.AddMonths(-1),
                        ExpiryDate = now.AddDays(4), // Expiring Soon!
                        Status = "Active",
                        MembershipPlanId = pStarter?.Id,
                        AssignedTrainerId = t2
                    },
                    // Expired members
                    new Member
                    {
                        Name = "Michael Brown",
                        Email = "michael.b@example.com",
                        Phone = "+1 (555) 234-5671",
                        EmergencyContact = "Laura Brown (+1 555-234-5672)",
                        JoinDate = now.AddMonths(-4),
                        ExpiryDate = now.AddDays(-10), // Expired!
                        Status = "Expired",
                        MembershipPlanId = pStandard?.Id,
                        AssignedTrainerId = t1
                    },
                    new Member
                    {
                        Name = "Olivia Taylor",
                        Email = "olivia.t@example.com",
                        Phone = "+1 (555) 345-6782",
                        EmergencyContact = "James Taylor (+1 555-345-6783)",
                        JoinDate = now.AddMonths(-7),
                        ExpiryDate = now.AddDays(-30), // Expired!
                        Status = "Expired",
                        MembershipPlanId = pPro?.Id,
                        AssignedTrainerId = null
                    }
                };

                await context.Members.AddRangeAsync(members);
                await context.SaveChangesAsync();

                // Add payments for these members
                var payments = new List<Payment>
                {
                    new Payment
                    {
                        MemberId = members[0].Id,
                        Amount = pPro?.Price ?? 249.99m,
                        PaymentDate = now.AddMonths(-2),
                        PaymentMethod = "Card",
                        TransactionId = "TXN-88219A01",
                        Notes = "Pro Biannual initial subscription"
                    },
                    new Payment
                    {
                        MemberId = members[1].Id,
                        Amount = pStandard?.Price ?? 129.99m,
                        PaymentDate = now.AddMonths(-1),
                        PaymentMethod = "Mobile Banking",
                        TransactionId = "TXN-94120B02",
                        Notes = "Standard Quarterly registration"
                    },
                    new Payment
                    {
                        MemberId = members[2].Id,
                        Amount = pVip?.Price ?? 459.99m,
                        PaymentDate = now.AddMonths(-6),
                        PaymentMethod = "Bank Transfer",
                        TransactionId = "TXN-71932C03",
                        Notes = "VIP Annual Elite full upfront payment"
                    },
                    new Payment
                    {
                        MemberId = members[3].Id,
                        Amount = pStarter?.Price ?? 49.99m,
                        PaymentDate = now.AddMonths(-1),
                        PaymentMethod = "Cash",
                        TransactionId = "TXN-55821D04",
                        Notes = "Starter monthly registration"
                    },
                    new Payment
                    {
                        MemberId = members[4].Id,
                        Amount = pStandard?.Price ?? 129.99m,
                        PaymentDate = now.AddMonths(-4),
                        PaymentMethod = "Card",
                        TransactionId = "TXN-32910E05",
                        Notes = "Standard membership payment"
                    }
                };

                await context.Payments.AddRangeAsync(payments);
                await context.SaveChangesAsync();
            }

            // 6. Seed Notifications
            if (!await context.Notifications.AnyAsync())
            {
                var notifications = new List<Notification>
                {
                    new Notification
                    {
                        Title = "Membership Expiring Soon",
                        Message = "Member Emma Watson's Starter Monthly plan will expire in 4 days.",
                        Type = "warning",
                        CreatedAt = DateTime.UtcNow.AddHours(-3),
                        IsRead = false,
                        TargetRole = "ALL"
                    },
                    new Notification
                    {
                        Title = "New Payment Recorded",
                        Message = "Payment of $129.99 received from Sophia Martinez via Mobile Banking.",
                        Type = "success",
                        CreatedAt = DateTime.UtcNow.AddHours(-18),
                        IsRead = false,
                        TargetRole = "ALL"
                    },
                    new Notification
                    {
                        Title = "Expired Membership Alert",
                        Message = "Member Michael Brown has an expired membership as of 10 days ago.",
                        Type = "danger",
                        CreatedAt = DateTime.UtcNow.AddDays(-2),
                        IsRead = true,
                        TargetRole = "ALL"
                    },
                    new Notification
                    {
                        Title = "System Maintenance",
                        Message = "Gym facility equipment routine audit scheduled for this Sunday at 10 PM.",
                        Type = "info",
                        CreatedAt = DateTime.UtcNow.AddDays(-3),
                        IsRead = true,
                        TargetRole = "ALL"
                    }
                };
                await context.Notifications.AddRangeAsync(notifications);
                await context.SaveChangesAsync();
            }

            // 7. Seed Attendance Records
            if (!await context.Attendances.AnyAsync())
            {
                var members = await context.Members.ToListAsync();
                if (members.Any())
                {
                    var attendances = new List<Attendance>
                    {
                        new Attendance
                        {
                            MemberId = members[0].Id,
                            CheckInTime = DateTime.UtcNow.AddHours(-2).AddMinutes(-15),
                            CheckOutTime = DateTime.UtcNow.AddMinutes(-20),
                            Notes = "Cardio & Treadmill session"
                        },
                        new Attendance
                        {
                            MemberId = members[0].Id,
                            CheckInTime = DateTime.UtcNow.AddDays(-1).AddHours(-4),
                            CheckOutTime = DateTime.UtcNow.AddDays(-1).AddHours(-2).AddMinutes(-30),
                            Notes = "Upper body strength routine"
                        },
                        new Attendance
                        {
                            MemberId = members.Count > 1 ? members[1].Id : members[0].Id,
                            CheckInTime = DateTime.UtcNow.AddHours(-1),
                            CheckOutTime = null, // currently in gym
                            Notes = "Personal training session with coach"
                        },
                        new Attendance
                        {
                            MemberId = members.Count > 2 ? members[2].Id : members[0].Id,
                            CheckInTime = DateTime.UtcNow.AddDays(-2).AddHours(-5),
                            CheckOutTime = DateTime.UtcNow.AddDays(-2).AddHours(-3).AddMinutes(-45),
                            Notes = "Leg day and sauna recovery"
                        }
                    };
                    await context.Attendances.AddRangeAsync(attendances);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
