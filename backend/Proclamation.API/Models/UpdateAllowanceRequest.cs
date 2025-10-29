namespace Proclamation.API.Models;

public class UpdateAllowanceRequest
{
    public decimal? Amount { get; set; }
    public int? Frequency { get; set; }
    public int? DayOfWeek { get; set; }
    public int? DayOfMonth { get; set; }
    public bool? IsActive { get; set; }
}


