namespace Proclamation.API.Models;

public class CreateChoreRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Reward { get; set; }
    public DateTime? DueDate { get; set; }
}

