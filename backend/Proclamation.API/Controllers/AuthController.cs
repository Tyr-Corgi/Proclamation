using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Proclamation.API.Models;
using Proclamation.Infrastructure.Data;
using Proclamation.Core.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Proclamation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly Dictionary<string, string> _verificationCodes = new(); // In-memory for development

    public AuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // Development bypass: Always returns success for code "123456"
    [HttpPost("request-verification")]
    public IActionResult RequestVerification([FromBody] RequestVerificationRequest request)
    {
        // In development: Always accept phone numbers
        // Store a dummy code for the phone number
        _verificationCodes[request.PhoneNumber] = "123456";
        
        return Ok(new { message = "Verification code sent (dev mode)" });
    }

    // Development bypass: Accept code "123456" for any phone number
    [HttpPost("verify-code")]
    public IActionResult VerifyCode([FromBody] VerifyCodeRequest request)
    {
        // Development bypass: Accept code "123456"
        if (request.Code == "123456" || 
            (_verificationCodes.TryGetValue(request.PhoneNumber, out var storedCode) && storedCode == request.Code))
        {
            // Check if user exists
            var user = _context.Users.FirstOrDefault(u => u.PhoneNumber == request.PhoneNumber);
            
            if (user == null)
            {
                // Return a success response indicating registration is needed
                return Ok(new { requiresRegistration = true });
            }
            
            // User exists, return auth
            var token = GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    PhoneNumber = user.PhoneNumber,
                    DisplayName = user.DisplayName,
                    Role = (int)user.Role,
                    FamilyId = user.FamilyId,
                    Balance = user.Balance
                }
            });
        }
        
        return BadRequest(new { message = "Invalid verification code" });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Check if user already exists
        if (await _context.Users.AnyAsync(u => u.PhoneNumber == request.PhoneNumber))
        {
            return BadRequest(new { message = "User already exists" });
        }

        var user = new User
        {
            PhoneNumber = request.PhoneNumber,
            DisplayName = request.DisplayName,
            Role = (UserRole)request.Role,
            Balance = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                PhoneNumber = user.PhoneNumber,
                DisplayName = user.DisplayName,
                Role = (int)user.Role,
                FamilyId = user.FamilyId,
                Balance = user.Balance
            }
        });
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
            expires: DateTime.UtcNow.AddDays(30), // Long expiry for development
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

