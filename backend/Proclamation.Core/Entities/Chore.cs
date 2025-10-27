namespace Proclamation.Core.Entities;

public class Chore
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Reward { get; set; }
    public int? AssignedToId { get; set; }
    public int CreatedById { get; set; }
    public int FamilyId { get; set; }
    public ChoreStatus Status { get; set; } = ChoreStatus.Available;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    // Navigation properties
    public User? AssignedTo { get; set; }
    public User CreatedBy { get; set; } = null!;
}

public enum ChoreStatus
{
    Available = 1,
    InProgress = 2,
    PendingApproval = 3,
    Completed = 4,
    Cancelled = 5
}

