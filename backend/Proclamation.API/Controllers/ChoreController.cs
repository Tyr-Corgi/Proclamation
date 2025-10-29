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
public class ChoreController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ChoreController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return int.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<IActionResult> GetChores()
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family to view chores" });
        }

        var chores = await _context.Chores
            .Where(c => c.FamilyId == user.FamilyId)
            .Include(c => c.AssignedTo)
            .Include(c => c.CreatedBy)
            .OrderBy(c => c.Status)
            .ThenByDescending(c => c.CreatedAt)
            .Select(c => new ChoreResponse
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Reward = c.Reward,
                AssignedToId = c.AssignedToId,
                AssignedToName = c.AssignedTo != null ? c.AssignedTo.DisplayName : null,
                CreatedById = c.CreatedById,
                CreatedByName = c.CreatedBy != null ? c.CreatedBy.DisplayName : "Unknown",
                FamilyId = c.FamilyId,
                Status = (int)c.Status,
                StatusName = c.Status.ToString(),
                DueDate = c.DueDate,
                CreatedAt = c.CreatedAt,
                CompletedAt = c.CompletedAt,
                ClaimedAt = c.ClaimedAt,
                CompletionNotes = c.CompletionNotes
            })
            .ToListAsync();

        return Ok(new { chores });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetChore(int id)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family to view chores" });
        }

        var chore = await _context.Chores
            .Where(c => c.Id == id && c.FamilyId == user.FamilyId)
            .Include(c => c.AssignedTo)
            .Include(c => c.CreatedBy)
            .Select(c => new ChoreResponse
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Reward = c.Reward,
                AssignedToId = c.AssignedToId,
                AssignedToName = c.AssignedTo != null ? c.AssignedTo.DisplayName : null,
                CreatedById = c.CreatedById,
                CreatedByName = c.CreatedBy != null ? c.CreatedBy.DisplayName : "Unknown",
                FamilyId = c.FamilyId,
                Status = (int)c.Status,
                StatusName = c.Status.ToString(),
                DueDate = c.DueDate,
                CreatedAt = c.CreatedAt,
                CompletedAt = c.CompletedAt,
                ClaimedAt = c.ClaimedAt,
                CompletionNotes = c.CompletionNotes
            })
            .FirstOrDefaultAsync();

        if (chore == null)
        {
            return NotFound(new { message = "Chore not found" });
        }

        return Ok(chore);
    }

    [HttpPost]
    public async Task<IActionResult> CreateChore([FromBody] CreateChoreRequest request)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family to create chores" });
        }

        if (user.Role != UserRole.Parent)
        {
            return BadRequest(new { message = "Only parents can create chores" });
        }

        var chore = new Chore
        {
            Title = request.Title,
            Description = request.Description,
            Reward = request.Reward,
            DueDate = request.DueDate,
            CreatedById = userId,
            FamilyId = user.FamilyId.Value,
            Status = ChoreStatus.Available
        };

        _context.Chores.Add(chore);
        await _context.SaveChangesAsync();

        var choreResponse = new ChoreResponse
        {
            Id = chore.Id,
            Title = chore.Title,
            Description = chore.Description,
            Reward = chore.Reward,
            AssignedToId = chore.AssignedToId,
            CreatedById = chore.CreatedById,
            CreatedByName = user.DisplayName,
            FamilyId = chore.FamilyId,
            Status = (int)chore.Status,
            StatusName = chore.Status.ToString(),
            DueDate = chore.DueDate,
            CreatedAt = chore.CreatedAt
        };

        return Ok(new { message = "Chore created successfully", chore = choreResponse });
    }

    [HttpPost("{id}/claim")]
    public async Task<IActionResult> ClaimChore(int id)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family to claim chores" });
        }

        var chore = await _context.Chores
            .Where(c => c.Id == id && c.FamilyId == user.FamilyId)
            .FirstOrDefaultAsync();

        if (chore == null)
        {
            return NotFound(new { message = "Chore not found" });
        }

        if (chore.Status != ChoreStatus.Available)
        {
            return BadRequest(new { message = "This chore is not available" });
        }

        chore.AssignedToId = userId;
        chore.Status = ChoreStatus.InProgress;
        chore.ClaimedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Chore claimed successfully" });
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteChore(int id, [FromBody] UpdateChoreStatusRequest request)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family" });
        }

        var chore = await _context.Chores
            .Where(c => c.Id == id && c.FamilyId == user.FamilyId)
            .FirstOrDefaultAsync();

        if (chore == null)
        {
            return NotFound(new { message = "Chore not found" });
        }

        if (chore.AssignedToId != userId)
        {
            return BadRequest(new { message = "You can only complete your own chores" });
        }

        if (chore.Status != ChoreStatus.InProgress)
        {
            return BadRequest(new { message = "This chore is not in progress" });
        }

        chore.Status = ChoreStatus.PendingApproval;
        chore.CompletionNotes = request.CompletionNotes;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Chore submitted for approval" });
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveChore(int id)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family" });
        }

        if (user.Role != UserRole.Parent)
        {
            return BadRequest(new { message = "Only parents can approve chores" });
        }

        var chore = await _context.Chores
            .Where(c => c.Id == id && c.FamilyId == user.FamilyId)
            .Include(c => c.AssignedTo)
            .FirstOrDefaultAsync();

        if (chore == null)
        {
            return NotFound(new { message = "Chore not found" });
        }

        if (chore.Status != ChoreStatus.PendingApproval)
        {
            return BadRequest(new { message = "This chore is not pending approval" });
        }

        if (chore.AssignedTo == null)
        {
            return BadRequest(new { message = "Chore has no assignee" });
        }

        // Mark chore as completed
        chore.Status = ChoreStatus.Completed;
        chore.CompletedAt = DateTime.UtcNow;

        // Pay the child
        chore.AssignedTo.Balance += chore.Reward;

        // Record the transaction
        var transaction = new Transaction
        {
            Amount = chore.Reward,
            FromUserId = userId,
            ToUserId = chore.AssignedToId.Value,
            FamilyId = user.FamilyId.Value,
            Type = TransactionType.ChoreReward,
            Description = $"Reward for completing: {chore.Title}"
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Chore approved and payment processed", reward = chore.Reward });
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectChore(int id)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family" });
        }

        if (user.Role != UserRole.Parent)
        {
            return BadRequest(new { message = "Only parents can reject chores" });
        }

        var chore = await _context.Chores
            .Where(c => c.Id == id && c.FamilyId == user.FamilyId)
            .FirstOrDefaultAsync();

        if (chore == null)
        {
            return NotFound(new { message = "Chore not found" });
        }

        if (chore.Status != ChoreStatus.PendingApproval)
        {
            return BadRequest(new { message = "This chore is not pending approval" });
        }

        chore.Status = ChoreStatus.InProgress;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Chore rejected, status returned to in progress" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChore(int id)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
        {
            return BadRequest(new { message = "You must be part of a family" });
        }

        if (user.Role != UserRole.Parent)
        {
            return BadRequest(new { message = "Only parents can delete chores" });
        }

        var chore = await _context.Chores
            .Where(c => c.Id == id && c.FamilyId == user.FamilyId)
            .FirstOrDefaultAsync();

        if (chore == null)
        {
            return NotFound(new { message = "Chore not found" });
        }

        _context.Chores.Remove(chore);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Chore deleted successfully" });
    }
}

