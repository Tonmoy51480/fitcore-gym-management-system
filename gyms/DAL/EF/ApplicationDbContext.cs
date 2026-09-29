using DAL.EF.Models;
using Microsoft.EntityFrameworkCore;

namespace DAL.EF
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Member> Members { get; set; } = null!;
        public DbSet<Trainer> Trainers { get; set; } = null!;
        public DbSet<Workout> Workouts { get; set; } = null!;
        public DbSet<MembershipPlan> MembershipPlans { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Precision for decimals
            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<MembershipPlan>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            // Member Relationships
            modelBuilder.Entity<Member>()
                .HasOne(m => m.MembershipPlan)
                .WithMany(p => p.Members)
                .HasForeignKey(m => m.MembershipPlanId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Member>()
                .HasOne(m => m.AssignedTrainer)
                .WithMany(t => t.Members)
                .HasForeignKey(m => m.AssignedTrainerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Member>()
                .HasMany(m => m.Payments)
                .WithOne(p => p.Member)
                .HasForeignKey(p => p.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            // Workout Relationships
            modelBuilder.Entity<Workout>()
                .HasOne(w => w.Trainer)
                .WithMany(t => t.Workouts)
                .HasForeignKey(w => w.TrainerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Performance Indexes
            modelBuilder.Entity<Member>()
                .HasIndex(m => m.Email);

            modelBuilder.Entity<Member>()
                .HasIndex(m => m.ExpiryDate);

            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.PaymentDate);
        }
    }
}
