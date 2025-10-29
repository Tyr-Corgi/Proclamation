namespace Proclamation.API.Models;

public class AllowanceResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int FamilyId { get; set; }
    public decimal Amount { get; set; }
    public int Frequency { get; set; }
    public string FrequencyName { get; set; } = string.Empty;
    public int? DayOfWeek { get; set; }
    public string? DayOfWeekName { get; set; }
    public int? DayOfMonth { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastProcessedAt { get; set; }
    public DateTime? NextPaymentDate { get; set; }
}


