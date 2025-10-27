using Microsoft.EntityFrameworkCore;
using Proclamation.Core.Entities;

namespace Proclamation.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Family> Families { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Chore> Chores { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.PhoneNumber).IsRequired().HasMaxLength(20);
            entity.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Balance).HasPrecision(18, 2);
            entity.HasIndex(u => u.PhoneNumber).IsUnique();
        });

        // Family configuration
        modelBuilder.Entity<Family>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.Property(f => f.Name).IsRequired().HasMaxLength(100);
        });

        // Message configuration
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Content).IsRequired();
            entity.HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(m => m.Family)
                .WithMany(f => f.Messages)
                .HasForeignKey(m => m.FamilyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Transaction configuration
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Amount).HasPrecision(18, 2);
            entity.HasOne(t => t.FromUser)
                .WithMany(u => u.SentTransactions)
                .HasForeignKey(t => t.FromUserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(t => t.ToUser)
                .WithMany(u => u.ReceivedTransactions)
                .HasForeignKey(t => t.ToUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Chore configuration
        modelBuilder.Entity<Chore>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Title).IsRequired().HasMaxLength(200);
            entity.Property(c => c.Reward).HasPrecision(18, 2);
            entity.HasOne(c => c.AssignedTo)
                .WithMany(u => u.AssignedChores)
                .HasForeignKey(c => c.AssignedToId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(c => c.CreatedBy)
                .WithMany(u => u.CreatedChores)
                .HasForeignKey(c => c.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

