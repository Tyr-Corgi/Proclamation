namespace Proclamation.Core.Entities;

public class Family
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? InviteCodeExpiresAt { get; set; }
    
    // Settings
    public decimal DefaultAllowance { get; set; } = 0;
    public bool AllowChildrenToCreateChores { get; set; } = false;
    
    // Navigation properties
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public ICollection<Chore> Chores { get; set; } = new List<Chore>();
}

