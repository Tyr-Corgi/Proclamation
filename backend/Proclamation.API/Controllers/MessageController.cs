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
public class MessageController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MessageController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    // POST: api/message
    [HttpPost]
    public async Task<ActionResult<MessageResponse>> SendMessage([FromBody] SendMessageRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users
            .Include(u => u.Family)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return Unauthorized();

        if (user.FamilyId == null)
            return BadRequest(new { message = "You must be part of a family to send messages" });

        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { message = "Message content cannot be empty" });

        var message = new Message
        {
            SenderId = userId,
            FamilyId = user.FamilyId.Value,
            Content = request.Content.Trim(),
            Timestamp = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return Ok(new MessageResponse
        {
            Id = message.Id,
            SenderId = user.Id,
            SenderName = user.DisplayName,
            SenderRole = (int)user.Role,
            FamilyId = message.FamilyId,
            Content = message.Content,
            Timestamp = message.Timestamp,
            CreatedAt = message.CreatedAt,
            IsRead = true, // Sender has "read" their own message
            ReadCount = 0
        });
    }

    // GET: api/message
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageResponse>>> GetMessages(
        [FromQuery] int? limit = 50,
        [FromQuery] int? beforeId = null)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
            return NotFound(new { message = "You are not part of any family" });

        var query = _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.MessageReads)
            .Where(m => m.FamilyId == user.FamilyId && !m.IsDeleted)
            .OrderByDescending(m => m.Id);

        // Pagination: get messages before a specific ID
        if (beforeId.HasValue)
        {
            query = (IOrderedQueryable<Message>)query.Where(m => m.Id < beforeId.Value);
        }

        var messages = await query
            .Take(limit.Value)
            .ToListAsync();

        var messageResponses = messages.Select(m => new MessageResponse
        {
            Id = m.Id,
            SenderId = m.SenderId,
            SenderName = m.Sender.DisplayName,
            SenderRole = (int)m.Sender.Role,
            FamilyId = m.FamilyId,
            Content = m.Content,
            Timestamp = m.Timestamp,
            CreatedAt = m.CreatedAt,
            IsRead = m.MessageReads.Any(mr => mr.UserId == userId),
            ReadCount = m.MessageReads.Count
        }).Reverse().ToList(); // Reverse to show oldest first

        return Ok(messageResponses);
    }

    // POST: api/message/{id}/read
    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
            return NotFound(new { message = "You are not part of any family" });

        var message = await _context.Messages
            .Include(m => m.MessageReads)
            .FirstOrDefaultAsync(m => m.Id == id && m.FamilyId == user.FamilyId);

        if (message == null)
            return NotFound(new { message = "Message not found" });

        // Check if already marked as read
        if (message.MessageReads.Any(mr => mr.UserId == userId))
            return Ok(new { message = "Already marked as read" });

        var messageRead = new MessageRead
        {
            MessageId = id,
            UserId = userId,
            ReadAt = DateTime.UtcNow
        };

        _context.MessageReads.Add(messageRead);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Message marked as read" });
    }

    // POST: api/message/read-all
    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
            return NotFound(new { message = "You are not part of any family" });

        // Get all unread messages in the user's family
        var unreadMessages = await _context.Messages
            .Include(m => m.MessageReads)
            .Where(m => m.FamilyId == user.FamilyId 
                && !m.IsDeleted 
                && !m.MessageReads.Any(mr => mr.UserId == userId)
                && m.SenderId != userId) // Don't mark own messages
            .ToListAsync();

        var messageReads = unreadMessages.Select(m => new MessageRead
        {
            MessageId = m.Id,
            UserId = userId,
            ReadAt = DateTime.UtcNow
        }).ToList();

        _context.MessageReads.AddRange(messageReads);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Marked {messageReads.Count} messages as read" });
    }

    // GET: api/message/unread-count
    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
            return Ok(0);

        var unreadCount = await _context.Messages
            .Include(m => m.MessageReads)
            .Where(m => m.FamilyId == user.FamilyId 
                && !m.IsDeleted 
                && !m.MessageReads.Any(mr => mr.UserId == userId)
                && m.SenderId != userId) // Don't count own messages
            .CountAsync();

        return Ok(unreadCount);
    }

    // DELETE: api/message/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMessage(int id)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user?.FamilyId == null)
            return NotFound(new { message = "You are not part of any family" });

        var message = await _context.Messages
            .FirstOrDefaultAsync(m => m.Id == id && m.FamilyId == user.FamilyId);

        if (message == null)
            return NotFound(new { message = "Message not found" });

        // Only sender or parents can delete messages
        if (message.SenderId != userId && user.Role != UserRole.Parent)
            return Forbid();

        message.IsDeleted = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Message deleted" });
    }
}

