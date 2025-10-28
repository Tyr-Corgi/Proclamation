# Chore Marketplace

## Overview
The Chore Marketplace is a gamified task management system where parents can create chores with rewards, and children can claim, complete, and earn money for finishing them.

## Features

### For Parents
- **Create Chores**: Set title, description, reward amount, and optional due date
- **Approve/Reject Submissions**: Review completed chores and approve payment
- **Delete Chores**: Remove chores that are no longer needed
- **Track Progress**: See all chores with status badges (Available, In Progress, Pending Approval, Completed)

### For Children
- **Browse Chores**: See all available chores in the family marketplace
- **Claim Chores**: Take ownership of available chores
- **Submit for Approval**: Mark chores as complete with optional notes
- **Earn Money**: Get paid when parents approve completed chores

## Chore Status Flow

```
1. Available (🆓)
   ↓ [Child claims chore]
2. In Progress (⏳)
   ↓ [Child submits for approval]
3. Pending Approval (⏱️)
   ↓ [Parent approves] or [Parent rejects → back to In Progress]
4. Completed (✅)
```

## API Endpoints

### GET `/api/chore`
Get all chores for the family.

**Response:**
```json
{
  "chores": [
    {
      "id": 1,
      "title": "Clean your room",
      "description": "Vacuum, dust, and organize everything",
      "reward": 5.00,
      "assignedToId": 2,
      "assignedToName": "Johnny",
      "createdById": 1,
      "createdByName": "Mom",
      "familyId": 1,
      "status": 2,
      "statusName": "InProgress",
      "dueDate": "2025-10-30T00:00:00Z",
      "createdAt": "2025-10-28T00:00:00Z",
      "claimedAt": "2025-10-28T01:00:00Z",
      "completedAt": null,
      "completionNotes": null
    }
  ]
}
```

### GET `/api/chore/{id}`
Get details of a specific chore.

### POST `/api/chore`
Create a new chore (parents only).

**Request:**
```json
{
  "title": "Clean your room",
  "description": "Vacuum, dust, and organize everything",
  "reward": 5.00,
  "dueDate": "2025-10-30T00:00:00Z"
}
```

### POST `/api/chore/{id}/claim`
Claim an available chore (children only).

### POST `/api/chore/{id}/complete`
Submit a chore for approval (assigned child only).

**Request:**
```json
{
  "completionNotes": "All done! Room is spotless!"
}
```

### POST `/api/chore/{id}/approve`
Approve a completed chore and pay the child (parents only).

**Response:**
```json
{
  "message": "Chore approved and payment processed",
  "reward": 5.00
}
```

### POST `/api/chore/{id}/reject`
Reject a chore submission and return to "In Progress" (parents only).

### DELETE `/api/chore/{id}`
Delete a chore (parents only).

## UI Screens

### 1. Chore List Screen
- **Stats Dashboard**: Shows Available, My Chores, and Pending counts
- **Chore Cards**: Display all chores with status badges, rewards, and assignments
- **Create Button**: For parents to add new chores
- **Pull to Refresh**: Update chore list

### 2. Create Chore Screen
- **Title Field**: Name of the chore
- **Description Field**: Detailed instructions
- **Reward Field**: Dollar amount to pay
- **Due Date Picker**: Optional deadline
- **Create Button**: Submit the new chore

### 3. Chore Detail Screen
- **Chore Info**: Full details including title, description, and reward
- **Status Badge**: Current status with color coding
- **Action Buttons**:
  - Children: "Claim This Chore" or "Submit for Approval"
  - Parents: "Approve & Pay" or "Reject" or "Delete Chore"
- **Completion Notes**: Optional field for children to add notes

## Database Schema

### Chore Entity
```csharp
public class Chore
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Reward { get; set; }
    public int? AssignedToId { get; set; }
    public int CreatedById { get; set; }
    public int FamilyId { get; set; }
    public ChoreStatus Status { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ClaimedAt { get; set; }
    public string? CompletionNotes { get; set; }
    
    // Navigation properties
    public User? AssignedTo { get; set; }
    public User CreatedBy { get; set; }
    public Family Family { get; set; }
}

public enum ChoreStatus
{
    Available = 1,
    InProgress = 2,
    PendingApproval = 3,
    Completed = 4,
    Cancelled = 5
}
```

## How to Use

### For Parents:
1. Navigate to Home Screen
2. Click "🧹 Chore Marketplace" button
3. Click "+ Create" in top right
4. Fill in chore details
5. Submit to make it available
6. Monitor pending approvals
7. Approve/reject completed chores

### For Children:
1. Navigate to Home Screen
2. Click "🧹 Chore Marketplace" button
3. Browse available chores
4. Tap a chore to see details
5. Click "Claim This Chore"
6. Complete the task
7. Submit for approval with notes
8. Wait for parent approval
9. Get paid!

## Payment Integration

When a parent approves a chore:
1. Child's balance is increased by the reward amount
2. A transaction is created with type `ChoreReward`
3. Chore status changes to `Completed`
4. Transaction appears in both child's and family's history

## Security

- Only family members can view family chores
- Only parents can create, approve, reject, or delete chores
- Only assigned children can complete their own chores
- Only available chores can be claimed
- Chore rewards are automatically paid on approval

## Future Enhancements

- **Recurring Chores**: Weekly/daily automatic chore creation
- **Photo Verification**: Upload proof of completion
- **Chore Templates**: Common chores that can be reused
- **Difficulty Levels**: Easy, Medium, Hard with suggested rewards
- **Bonus Rewards**: Extra pay for early completion
- **Chore Categories**: Organize by room or type

