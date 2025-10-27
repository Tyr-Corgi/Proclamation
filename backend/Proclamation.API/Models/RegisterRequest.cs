namespace Proclamation.API.Models;

public class RegisterRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int Role { get; set; } // 1 = Parent, 2 = Child
}

