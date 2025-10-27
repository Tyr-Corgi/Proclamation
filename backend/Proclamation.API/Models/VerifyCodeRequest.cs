namespace Proclamation.API.Models;

public class VerifyCodeRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

