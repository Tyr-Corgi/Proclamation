namespace Proclamation.Core.Entities;

public class Message
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public int FamilyId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User Sender { get; set; } = null!;
    public Family Family { get; set; } = null!;
    public ICollection<MessageRead> MessageReads { get; set; } = new List<MessageRead>();
}

// Track which users have read each message
public class MessageRead
{
    public int Id { get; set; }
    public int MessageId { get; set; }
    public int UserId { get; set; }
    public DateTime ReadAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Message Message { get; set; } = null!;
    public User User { get; set; } = null!;
}

