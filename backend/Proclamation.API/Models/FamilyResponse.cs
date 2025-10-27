namespace Proclamation.API.Models;

public class FamilyResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string InviteCode { get; set; } = string.Empty;
    public DateTime? InviteCodeExpiresAt { get; set; }
    public int MemberCount { get; set; }
    public decimal DefaultAllowance { get; set; }
    public bool AllowChildrenToCreateChores { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FamilyMemberResponse
{
    public int Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int Role { get; set; } // 1 = Parent, 2 = Child
    public decimal Balance { get; set; }
}

