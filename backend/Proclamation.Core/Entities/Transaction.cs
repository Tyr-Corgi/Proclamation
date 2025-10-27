namespace Proclamation.Core.Entities;

public class Transaction
{
    public int Id { get; set; }
    public int FromUserId { get; set; }
    public int ToUserId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    
    // Navigation properties
    public User FromUser { get; set; } = null!;
    public User ToUser { get; set; } = null!;
}

public enum TransactionType
{
    Allowance = 1,
    ChoreReward = 2,
    Transfer = 3,
    Adjustment = 4
}

