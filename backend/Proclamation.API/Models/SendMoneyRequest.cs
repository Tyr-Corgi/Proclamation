namespace Proclamation.API.Models;

public class SendMoneyRequest
{
    public int ToUserId { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}

