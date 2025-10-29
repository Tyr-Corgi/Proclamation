using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Proclamation.Infrastructure.Data;
using Proclamation.Core.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Proclamation.API.Models;

namespace Proclamation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DevController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public DevController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // DEV ONLY: Seed database with test family and return parent user for auto-login
    [HttpPost("seed")]
    public async Task<IActionResult> SeedTestData()
    {
        // Check if test family already exists
        var existingFamily = await _context.Families
            .FirstOrDefaultAsync(f => f.Name == "Test Family");

        if (existingFamily != null)
        {
            // Family already exists, return the first parent
            var existingParent = await _context.Users
                .FirstOrDefaultAsync(u => u.FamilyId == existingFamily.Id && u.Role == UserRole.Parent);

            if (existingParent != null)
            {
                var token = GenerateJwtToken(existingParent);
                return Ok(new AuthResponse
                {
                    Token = token,
                    User = new UserDto
                    {
                        Id = existingParent.Id,
                        PhoneNumber = existingParent.PhoneNumber,
                        DisplayName = existingParent.DisplayName,
                        Role = (int)existingParent.Role,
                        FamilyId = existingParent.FamilyId,
                        Balance = existingParent.Balance
                    }
                });
            }
        }

        // Create new test family
        var family = new Family
        {
            Name = "Test Family",
            InviteCode = GenerateInviteCode(),
            CreatedAt = DateTime.UtcNow,
            InviteCodeExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        _context.Families.Add(family);
        await _context.SaveChangesAsync();

        // Create 2 parent accounts
        var parent1 = new User
        {
            PhoneNumber = "+15555551001",
            DisplayName = "Parent One (You)",
            Role = UserRole.Parent,
            FamilyId = family.Id,
            Balance = 100.00m,
            CreatedAt = DateTime.UtcNow
        };

        var parent2 = new User
        {
            PhoneNumber = "+15555551002",
            DisplayName = "Parent Two",
            Role = UserRole.Parent,
            FamilyId = family.Id,
            Balance = 100.00m,
            CreatedAt = DateTime.UtcNow
        };

        // Create 3 child accounts
        var child1 = new User
        {
            PhoneNumber = "+15555552001",
            DisplayName = "Sarah",
            Role = UserRole.Child,
            FamilyId = family.Id,
            Balance = 25.00m,
            CreatedAt = DateTime.UtcNow
        };

        var child2 = new User
        {
            PhoneNumber = "+15555552002",
            DisplayName = "Michael",
            Role = UserRole.Child,
            FamilyId = family.Id,
            Balance = 30.00m,
            CreatedAt = DateTime.UtcNow
        };

        var child3 = new User
        {
            PhoneNumber = "+15555552003",
            DisplayName = "Emma",
            Role = UserRole.Child,
            FamilyId = family.Id,
            Balance = 15.00m,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.AddRange(parent1, parent2, child1, child2, child3);

        // Update family to set creator
        family.CreatedByUserId = parent1.Id;

        // Create some sample chores
        var chores = new List<Chore>
        {
            new Chore
            {
                Title = "Clean Your Room",
                Description = "Vacuum, dust, and organize your bedroom",
                Reward = 5.00m,
                FamilyId = family.Id,
                CreatedById = parent1.Id,
                Status = ChoreStatus.Available,
                CreatedAt = DateTime.UtcNow
            },
            new Chore
            {
                Title = "Wash Dishes",
                Description = "Wash and dry all dishes in the sink",
                Reward = 3.00m,
                FamilyId = family.Id,
                CreatedById = parent1.Id,
                Status = ChoreStatus.Available,
                CreatedAt = DateTime.UtcNow
            },
            new Chore
            {
                Title = "Take Out Trash",
                Description = "Empty all trash cans and take to outdoor bins",
                Reward = 2.50m,
                FamilyId = family.Id,
                CreatedById = parent2.Id,
                Status = ChoreStatus.Claimed,
                ClaimedByUserId = child1.Id,
                ClaimedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            },
            new Chore
            {
                Title = "Mow the Lawn",
                Description = "Mow front and back lawn",
                Reward = 10.00m,
                FamilyId = family.Id,
                CreatedById = parent1.Id,
                Status = ChoreStatus.Available,
                CreatedAt = DateTime.UtcNow
            }
        };

        _context.Chores.AddRange(chores);

        // Create a sample message
        var message = new Message
        {
            Content = "Welcome to the Test Family! This is a sample message.",
            SenderId = parent1.Id,
            FamilyId = family.Id,
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);

        await _context.SaveChangesAsync();

        // Return parent1 with auth token for auto-login
        var authToken = GenerateJwtToken(parent1);

        return Ok(new AuthResponse
        {
            Token = authToken,
            User = new UserDto
            {
                Id = parent1.Id,
                PhoneNumber = parent1.PhoneNumber,
                DisplayName = parent1.DisplayName,
                Role = (int)parent1.Role,
                FamilyId = parent1.FamilyId,
                Balance = parent1.Balance
            }
        });
    }

    // DEV ONLY: Clear all test data
    [HttpPost("clear")]
    public async Task<IActionResult> ClearTestData()
    {
        var testFamily = await _context.Families
            .FirstOrDefaultAsync(f => f.Name == "Test Family");

        if (testFamily != null)
        {
            // Remove all related data
            var messages = await _context.Messages.Where(m => m.FamilyId == testFamily.Id).ToListAsync();
            var chores = await _context.Chores.Where(c => c.FamilyId == testFamily.Id).ToListAsync();
            var users = await _context.Users.Where(u => u.FamilyId == testFamily.Id).ToListAsync();

            _context.Messages.RemoveRange(messages);
            _context.Chores.RemoveRange(chores);
            _context.Users.RemoveRange(users);
            _context.Families.Remove(testFamily);

            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Test data cleared" });
    }

    private string GenerateInviteCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "YourSuperSecretKeyForDevelopmentOnlyChangeInProduction!@#$%^&*()";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "Proclamation";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.PhoneNumber),
            new Claim("DisplayName", user.DisplayName),
            new Claim("Role", ((int)user.Role).ToString()),
            new Claim("FamilyId", user.FamilyId?.ToString() ?? ""),
            new Claim("Balance", user.Balance.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtIssuer,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

