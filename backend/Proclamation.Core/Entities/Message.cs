namespace Proclamation.Core.Entities;

public class Message
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public int FamilyId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;
    
    // Navigation properties
    public User Sender { get; set; } = null!;
    public Family Family { get; set; } = null!;
}

