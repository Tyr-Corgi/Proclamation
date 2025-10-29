using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Proclamation.API.Models;
using Proclamation.Core.Entities;
using Proclamation.Infrastructure.Data;

namespace Proclamation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AllowanceController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AllowanceController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return int.Parse(userIdClaim!);
    }

    private string GetDayOfWeekName(int dayOfWeek)
    {
        return dayOfWeek switch
        {
            0 => "Sunday",
            1 => "Monday",
            2 => "Tuesday",
            3 => "Wednesday",
            4 => "Thursday",
            5 => "Friday",
            6 => "Saturday",
            _ => "Unknown"
        };
    }

    [HttpGet]
    public async Task<IActionResult> GetAllowances()
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family to view allowances" });
        }

        var allowances = await _context.Allowances
            .Where(a => a.FamilyId == user.FamilyId)
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AllowanceResponse
            {
                Id = a.Id,
                UserId = a.UserId,
                UserName = a.User.DisplayName,
                FamilyId = a.FamilyId,
                Amount = a.Amount,
                Frequency = (int)a.Frequency,
                FrequencyName = a.Frequency.ToString(),
                DayOfWeek = a.DayOfWeek,
                DayOfWeekName = a.DayOfWeek.HasValue ? GetDayOfWeekName(a.DayOfWeek.Value) : null,
                DayOfMonth = a.DayOfMonth,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                LastProcessedAt = a.LastProcessedAt,
                NextPaymentDate = a.NextPaymentDate
            })
            .ToListAsync();

        return Ok(new { allowances });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAllowance(int id)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family" });
        }

        var allowance = await _context.Allowances
            .Where(a => a.Id == id && a.FamilyId == user.FamilyId)
            .Include(a => a.User)
            .Select(a => new AllowanceResponse
            {
                Id = a.Id,
                UserId = a.UserId,
                UserName = a.User.DisplayName,
                FamilyId = a.FamilyId,
                Amount = a.Amount,
                Frequency = (int)a.Frequency,
                FrequencyName = a.Frequency.ToString(),
                DayOfWeek = a.DayOfWeek,
                DayOfWeekName = a.DayOfWeek.HasValue ? GetDayOfWeekName(a.DayOfWeek.Value) : null,
                DayOfMonth = a.DayOfMonth,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                LastProcessedAt = a.LastProcessedAt,
                NextPaymentDate = a.NextPaymentDate
            })
            .FirstOrDefaultAsync();

        if (allowance == null)
        {
            return NotFound(new { message = "Allowance not found" });
        }

        return Ok(allowance);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAllowance([FromBody] CreateAllowanceRequest request)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family to create allowances" });
        }

        if (user.Role != UserRole.Parent)
        {
            return BadRequest(new { message = "Only parents can create allowances" });
        }

        // Verify the target user is in the same family
        var targetUser = await _context.Users.FindAsync(request.UserId);
        if (targetUser == null || targetUser.FamilyId != user.FamilyId)
        {
            return BadRequest(new { message = "User not found or not in your family" });
        }

        // Validate frequency-specific fields
        var frequency = (AllowanceFrequency)request.Frequency;
        if ((frequency == AllowanceFrequency.Weekly || frequency == AllowanceFrequency.BiWeekly) && !request.DayOfWeek.HasValue)
        {
            return BadRequest(new { message = "Day of week is required for weekly/bi-weekly allowances" });
        }

        if (frequency == AllowanceFrequency.Monthly && !request.DayOfMonth.HasValue)
        {
            return BadRequest(new { message = "Day of month is required for monthly allowances" });
        }

        // Calculate next payment date
        var nextPaymentDate = CalculateNextPaymentDate(frequency, request.DayOfWeek, request.DayOfMonth);

        var allowance = new Allowance
        {
            UserId = request.UserId,
            FamilyId = user.FamilyId.Value,
            Amount = request.Amount,
            Frequency = frequency,
            DayOfWeek = request.DayOfWeek,
            DayOfMonth = request.DayOfMonth,
            IsActive = true,
            NextPaymentDate = nextPaymentDate
        };

        _context.Allowances.Add(allowance);
        await _context.SaveChangesAsync();

        var response = new AllowanceResponse
        {
            Id = allowance.Id,
            UserId = allowance.UserId,
            UserName = targetUser.DisplayName,
            FamilyId = allowance.FamilyId,
            Amount = allowance.Amount,
            Frequency = (int)allowance.Frequency,
            FrequencyName = allowance.Frequency.ToString(),
            DayOfWeek = allowance.DayOfWeek,
            DayOfWeekName = allowance.DayOfWeek.HasValue ? GetDayOfWeekName(allowance.DayOfWeek.Value) : null,
            DayOfMonth = allowance.DayOfMonth,
            IsActive = allowance.IsActive,
            CreatedAt = allowance.CreatedAt,
            NextPaymentDate = allowance.NextPaymentDate
        };

        return Ok(new { message = "Allowance created successfully", allowance = response });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAllowance(int id, [FromBody] UpdateAllowanceRequest request)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family" });
        }

        if (user.Role != UserRole.Parent)
        {
            return BadRequest(new { message = "Only parents can update allowances" });
        }

        var allowance = await _context.Allowances
            .Where(a => a.Id == id && a.FamilyId == user.FamilyId)
            .FirstOrDefaultAsync();

        if (allowance == null)
        {
            return NotFound(new { message = "Allowance not found" });
        }

        if (request.Amount.HasValue)
            allowance.Amount = request.Amount.Value;

        if (request.Frequency.HasValue)
            allowance.Frequency = (AllowanceFrequency)request.Frequency.Value;

        if (request.DayOfWeek.HasValue)
            allowance.DayOfWeek = request.DayOfWeek.Value;

        if (request.DayOfMonth.HasValue)
            allowance.DayOfMonth = request.DayOfMonth.Value;

        if (request.IsActive.HasValue)
            allowance.IsActive = request.IsActive.Value;

        // Recalculate next payment date if schedule changed
        if (request.Frequency.HasValue || request.DayOfWeek.HasValue || request.DayOfMonth.HasValue)
        {
            allowance.NextPaymentDate = CalculateNextPaymentDate(
                allowance.Frequency,
                allowance.DayOfWeek,
                allowance.DayOfMonth
            );
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Allowance updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAllowance(int id)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family" });
        }

        if (user.Role != UserRole.Parent)
        {
            return BadRequest(new { message = "Only parents can delete allowances" });
        }

        var allowance = await _context.Allowances
            .Where(a => a.Id == id && a.FamilyId == user.FamilyId)
            .FirstOrDefaultAsync();

        if (allowance == null)
        {
            return NotFound(new { message = "Allowance not found" });
        }

        _context.Allowances.Remove(allowance);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Allowance deleted successfully" });
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessAllowances()
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family" });
        }

        if (user.Role != UserRole.Parent)
        {
            return BadRequest(new { message = "Only parents can manually process allowances" });
        }

        var now = DateTime.UtcNow;
        var allowances = await _context.Allowances
            .Where(a => a.FamilyId == user.FamilyId && 
                       a.IsActive && 
                       a.NextPaymentDate <= now)
            .Include(a => a.User)
            .ToListAsync();

        var processed = 0;
        foreach (var allowance in allowances)
        {
            // Pay the allowance
            allowance.User.Balance += allowance.Amount;
            
            // Record the transaction
            var transaction = new Transaction
            {
                Amount = allowance.Amount,
                FromUserId = userId,
                ToUserId = allowance.UserId,
                FamilyId = user.FamilyId.Value,
                Type = TransactionType.Allowance,
                Description = $"Allowance payment: {allowance.Frequency}"
            };
            _context.Transactions.Add(transaction);

            // Update allowance
            allowance.LastProcessedAt = now;
            allowance.NextPaymentDate = CalculateNextPaymentDate(
                allowance.Frequency,
                allowance.DayOfWeek,
                allowance.DayOfMonth
            );

            processed++;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Processed {processed} allowances", count = processed });
    }

    private DateTime? CalculateNextPaymentDate(AllowanceFrequency frequency, int? dayOfWeek, int? dayOfMonth)
    {
        var now = DateTime.UtcNow;

        switch (frequency)
        {
            case AllowanceFrequency.Weekly:
                if (!dayOfWeek.HasValue) return null;
                var daysUntilTarget = ((int)dayOfWeek.Value - (int)now.DayOfWeek + 7) % 7;
                if (daysUntilTarget == 0) daysUntilTarget = 7; // If today, schedule for next week
                return now.Date.AddDays(daysUntilTarget);

            case AllowanceFrequency.BiWeekly:
                if (!dayOfWeek.HasValue) return null;
                var biWeeklyDays = ((int)dayOfWeek.Value - (int)now.DayOfWeek + 7) % 7;
                if (biWeeklyDays == 0) biWeeklyDays = 14; // If today, schedule for two weeks
                else biWeeklyDays += 7; // Add extra week for bi-weekly
                return now.Date.AddDays(biWeeklyDays);

            case AllowanceFrequency.Monthly:
                if (!dayOfMonth.HasValue) return null;
                var targetMonth = now.Day >= dayOfMonth.Value ? now.AddMonths(1) : now;
                var daysInMonth = DateTime.DaysInMonth(targetMonth.Year, targetMonth.Month);
                var actualDay = Math.Min(dayOfMonth.Value, daysInMonth);
                return new DateTime(targetMonth.Year, targetMonth.Month, actualDay);

            default:
                return null;
        }
    }
}

