namespace Proclamation.API.Models;

public class UpdateChoreStatusRequest
{
    public int Status { get; set; }
    public string? CompletionNotes { get; set; }
}

