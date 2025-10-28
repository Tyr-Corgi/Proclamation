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
public class TransactionController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransactionController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    // POST: api/transaction/send
    [HttpPost("send")]
    public async Task<ActionResult<TransactionResponse>> SendMoney([FromBody] SendMoneyRequest request)
    {
        var userId = GetCurrentUserId();
        var fromUser = await _context.Users
            .Include(u => u.Family)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (fromUser == null)
            return Unauthorized();

        // Only parents can send money
        if (fromUser.Role != UserRole.Parent)
            return Forbid();

        if (fromUser.FamilyId == null)
            return BadRequest(new { message = "You must be part of a family to send money" });

        if (request.Amount <= 0)
            return BadRequest(new { message = "Amount must be greater than zero" });

        // Get recipient
        var toUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.ToUserId && u.FamilyId == fromUser.FamilyId);

        if (toUser == null)
            return NotFound(new { message = "Recipient not found or not in your family" });

        if (toUser.Id == fromUser.Id)
            return BadRequest(new { message = "Cannot send money to yourself" });

        // Create transaction
        var transaction = new Transaction
        {
            FromUserId = fromUser.Id,
            ToUserId = toUser.Id,
            Amount = request.Amount,
            Type = TransactionType.Allowance,
            Description = request.Description ?? $"Allowance from {fromUser.DisplayName}",
            FamilyId = fromUser.FamilyId,
            Timestamp = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        // Update balances
        toUser.Balance += request.Amount;

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(new TransactionResponse
        {
            Id = transaction.Id,
            FromUserId = fromUser.Id,
            FromUserName = fromUser.DisplayName,
            ToUserId = toUser.Id,
            ToUserName = toUser.DisplayName,
            Amount = transaction.Amount,
            Type = (int)transaction.Type,
            TypeName = transaction.Type.ToString(),
            Timestamp = transaction.Timestamp,
            CreatedAt = transaction.CreatedAt,
            Description = transaction.Description
        });
    }

    // GET: api/transaction
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionResponse>>> GetTransactions(
        [FromQuery] int? limit = 50)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
            return NotFound(new { message = "You are not part of any family" });

        // Get transactions for current user or their family (if parent)
        var query = _context.Transactions
            .Include(t => t.FromUser)
            .Include(t => t.ToUser)
            .Where(t => t.FamilyId == user.FamilyId)
            .OrderByDescending(t => t.Id);

        // If child, only show their own transactions
        if (user.Role == UserRole.Child)
        {
            query = (IOrderedQueryable<Transaction>)query.Where(t => t.FromUserId == userId || t.ToUserId == userId);
        }

        var transactions = await query
            .Take(limit.Value)
            .ToListAsync();

        var transactionResponses = transactions.Select(t => new TransactionResponse
        {
            Id = t.Id,
            FromUserId = t.FromUserId,
            FromUserName = t.FromUser.DisplayName,
            ToUserId = t.ToUserId,
            ToUserName = t.ToUser.DisplayName,
            Amount = t.Amount,
            Type = (int)t.Type,
            TypeName = t.Type.ToString(),
            Timestamp = t.Timestamp,
            CreatedAt = t.CreatedAt,
            Description = t.Description
        }).ToList();

        return Ok(transactionResponses);
    }

    // GET: api/transaction/my-history
    [HttpGet("my-history")]
    public async Task<ActionResult<IEnumerable<TransactionResponse>>> GetMyTransactions(
        [FromQuery] int? limit = 50)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return Unauthorized();

        var transactions = await _context.Transactions
            .Include(t => t.FromUser)
            .Include(t => t.ToUser)
            .Where(t => t.FromUserId == userId || t.ToUserId == userId)
            .OrderByDescending(t => t.Id)
            .Take(limit.Value)
            .ToListAsync();

        var transactionResponses = transactions.Select(t => new TransactionResponse
        {
            Id = t.Id,
            FromUserId = t.FromUserId,
            FromUserName = t.FromUser.DisplayName,
            ToUserId = t.ToUserId,
            ToUserName = t.ToUser.DisplayName,
            Amount = t.Amount,
            Type = (int)t.Type,
            TypeName = t.Type.ToString(),
            Timestamp = t.Timestamp,
            CreatedAt = t.CreatedAt,
            Description = t.Description
        }).ToList();

        return Ok(transactionResponses);
    }

    // GET: api/transaction/balance
    [HttpGet("balance")]
    public async Task<ActionResult<decimal>> GetBalance()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return Unauthorized();

        return Ok(user.Balance);
    }

    // GET: api/transaction/family-members
    [HttpGet("family-members")]
    public async Task<ActionResult<IEnumerable<object>>> GetFamilyMembers()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
            return NotFound(new { message = "You are not part of any family" });

        // Only parents can see family members for sending money
        if (user.Role != UserRole.Parent)
            return Forbid();

        var members = await _context.Users
            .Where(u => u.FamilyId == user.FamilyId && u.Id != userId)
            .Select(u => new
            {
                u.Id,
                u.DisplayName,
                u.Role,
                u.Balance
            })
            .ToListAsync();

        return Ok(members);
    }
}

