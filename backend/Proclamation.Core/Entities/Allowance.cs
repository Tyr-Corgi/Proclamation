namespace Proclamation.Core.Entities;

public class Allowance
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int FamilyId { get; set; }
    public decimal Amount { get; set; }
    public AllowanceFrequency Frequency { get; set; }
    public int? DayOfWeek { get; set; } // 0-6 for weekly (0 = Sunday)
    public int? DayOfMonth { get; set; } // 1-31 for monthly
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastProcessedAt { get; set; }
    public DateTime? NextPaymentDate { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Family Family { get; set; } = null!;
}

public enum AllowanceFrequency
{
    Weekly = 1,
    BiWeekly = 2,
    Monthly = 3
}


