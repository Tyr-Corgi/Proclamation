namespace Proclamation.API.Models;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int Role { get; set; }
    public int? FamilyId { get; set; }
    public decimal Balance { get; set; }
}

