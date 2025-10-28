namespace Proclamation.API.Models;

public class MessageResponse
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public int SenderRole { get; set; }
    public int FamilyId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public int ReadCount { get; set; }
}

