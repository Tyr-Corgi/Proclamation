namespace Proclamation.Core.Entities;

public class Family
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}

