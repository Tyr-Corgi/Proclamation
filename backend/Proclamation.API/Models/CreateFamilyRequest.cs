namespace Proclamation.API.Models;

public class CreateFamilyRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal DefaultAllowance { get; set; } = 0;
    public bool AllowChildrenToCreateChores { get; set; } = false;
}

