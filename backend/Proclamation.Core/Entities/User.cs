namespace Proclamation.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public int? FamilyId { get; set; }
    public decimal Balance { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActiveAt { get; set; }
    
    // Navigation properties
    public Family? Family { get; set; }
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Transaction> SentTransactions { get; set; } = new List<Transaction>();
    public ICollection<Transaction> ReceivedTransactions { get; set; } = new List<Transaction>();
    public ICollection<Chore> CreatedChores { get; set; } = new List<Chore>();
    public ICollection<Chore> AssignedChores { get; set; } = new List<Chore>();
}

public enum UserRole
{
    Parent = 1,
    Child = 2
}

