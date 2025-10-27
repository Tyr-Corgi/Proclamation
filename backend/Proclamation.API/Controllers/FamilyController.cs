using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Proclamation.API.Models;
using Proclamation.Core.Entities;
using Proclamation.Infrastructure.Data;
using System.Security.Claims;

namespace Proclamation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FamilyController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FamilyController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    // POST: api/family/create
    [HttpPost("create")]
    public async Task<ActionResult<FamilyResponse>> CreateFamily([FromBody] CreateFamilyRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return Unauthorized();

        // Check if user is a parent
        if (user.Role != UserRole.Parent)
            return BadRequest(new { message = "Only parents can create families" });

        // Check if user already has a family
        if (user.FamilyId != null)
            return BadRequest(new { message = "You are already part of a family" });

        // Generate unique invite code
        var inviteCode = GenerateInviteCode();

        var family = new Family
        {
            Name = request.Name,
            InviteCode = inviteCode,
            CreatedByUserId = userId,
            DefaultAllowance = request.DefaultAllowance,
            AllowChildrenToCreateChores = request.AllowChildrenToCreateChores,
            InviteCodeExpiresAt = DateTime.UtcNow.AddDays(30) // Expires in 30 days
        };

        _context.Families.Add(family);
        await _context.SaveChangesAsync();

        // Add creator to family
        user.FamilyId = family.Id;
        await _context.SaveChangesAsync();

        return Ok(new FamilyResponse
        {
            Id = family.Id,
            Name = family.Name,
            InviteCode = family.InviteCode,
            InviteCodeExpiresAt = family.InviteCodeExpiresAt,
            MemberCount = 1,
            DefaultAllowance = family.DefaultAllowance,
            AllowChildrenToCreateChores = family.AllowChildrenToCreateChores,
            CreatedAt = family.CreatedAt
        });
    }

    // POST: api/family/join
    [HttpPost("join")]
    public async Task<ActionResult<FamilyResponse>> JoinFamily([FromBody] JoinFamilyRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return Unauthorized();

        // Check if user already has a family
        if (user.FamilyId != null)
            return BadRequest(new { message = "You are already part of a family" });

        // Find family by invite code
        var family = await _context.Families
            .Include(f => f.Members)
            .FirstOrDefaultAsync(f => f.InviteCode == request.InviteCode);

        if (family == null)
            return BadRequest(new { message = "Invalid invite code" });

        // Check if invite code is expired
        if (family.InviteCodeExpiresAt.HasValue && family.InviteCodeExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "Invite code has expired" });

        // Add user to family
        user.FamilyId = family.Id;
        await _context.SaveChangesAsync();

        return Ok(new FamilyResponse
        {
            Id = family.Id,
            Name = family.Name,
            InviteCode = family.InviteCode,
            InviteCodeExpiresAt = family.InviteCodeExpiresAt,
            MemberCount = family.Members.Count + 1,
            DefaultAllowance = family.DefaultAllowance,
            AllowChildrenToCreateChores = family.AllowChildrenToCreateChores,
            CreatedAt = family.CreatedAt
        });
    }

    // GET: api/family
    [HttpGet]
    public async Task<ActionResult<FamilyResponse>> GetMyFamily()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users
            .Include(u => u.Family)
                .ThenInclude(f => f!.Members)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Family == null)
            return NotFound(new { message = "You are not part of any family" });

        var family = user.Family;

        return Ok(new FamilyResponse
        {
            Id = family.Id,
            Name = family.Name,
            InviteCode = family.InviteCode,
            InviteCodeExpiresAt = family.InviteCodeExpiresAt,
            MemberCount = family.Members.Count,
            DefaultAllowance = family.DefaultAllowance,
            AllowChildrenToCreateChores = family.AllowChildrenToCreateChores,
            CreatedAt = family.CreatedAt
        });
    }

    // GET: api/family/members
    [HttpGet("members")]
    public async Task<ActionResult<IEnumerable<FamilyMemberResponse>>> GetFamilyMembers()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
            return NotFound(new { message = "You are not part of any family" });

        var members = await _context.Users
            .Where(u => u.FamilyId == user.FamilyId)
            .Select(u => new FamilyMemberResponse
            {
                Id = u.Id,
                DisplayName = u.DisplayName,
                PhoneNumber = u.PhoneNumber,
                Role = (int)u.Role,
                Balance = u.Balance
            })
            .ToListAsync();

        return Ok(members);
    }

    // POST: api/family/regenerate-invite
    [HttpPost("regenerate-invite")]
    public async Task<ActionResult<FamilyResponse>> RegenerateInviteCode()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users
            .Include(u => u.Family)
                .ThenInclude(f => f!.Members)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Family == null)
            return NotFound(new { message = "You are not part of any family" });

        // Check if user is a parent
        if (user.Role != UserRole.Parent)
            return BadRequest(new { message = "Only parents can regenerate invite codes" });

        var family = user.Family;
        family.InviteCode = GenerateInviteCode();
        family.InviteCodeExpiresAt = DateTime.UtcNow.AddDays(30);

        await _context.SaveChangesAsync();

        return Ok(new FamilyResponse
        {
            Id = family.Id,
            Name = family.Name,
            InviteCode = family.InviteCode,
            InviteCodeExpiresAt = family.InviteCodeExpiresAt,
            MemberCount = family.Members.Count,
            DefaultAllowance = family.DefaultAllowance,
            AllowChildrenToCreateChores = family.AllowChildrenToCreateChores,
            CreatedAt = family.CreatedAt
        });
    }

    // DELETE: api/family/leave
    [HttpDelete("leave")]
    public async Task<IActionResult> LeaveFamily()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
            return NotFound(new { message = "You are not part of any family" });

        user.FamilyId = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Successfully left the family" });
    }

    private static string GenerateInviteCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}

