namespace Proclamation.API.Models;

public class CreateAllowanceRequest
{
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public int Frequency { get; set; } // 1 = Weekly, 2 = BiWeekly, 3 = Monthly
    public int? DayOfWeek { get; set; } // 0-6 for weekly (0 = Sunday)
    public int? DayOfMonth { get; set; } // 1-31 for monthly
}

