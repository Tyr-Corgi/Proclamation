# Manual API Testing Guide

## Issue: Parallels Shared Folder

Your project is on a Parallels shared folder (`\\psf\`), which causes issues with both:
- File watchers (React Native/Expo)
- .NET file monitoring
- Database locking

## Solution: Copy to Local Drive

### Quick Copy Command
```powershell
# Copy entire project to Windows drive
xcopy C:\Mac\Home\Desktop\Repos\Proclamation C:\Users\tygr\Desktop\Proclamation /E /I /H /Y

# Navigate to new location
cd C:\Users\tygr\Desktop\Proclamation

# Start backend
cd backend
dotnet run --project Proclamation.API/Proclamation.API.csproj

# In another terminal: Start mobile app
cd C:\Users\tygr\Desktop\Proclamation\ProclamationApp
npm install
npm start
# Then press 'w' for web
```

---

## Alternative: Test with Postman or Browser

### Option 1: Use Swagger UI (Easiest)

1. **Start Backend** (from local drive)
```bash
cd C:\Users\tygr\Desktop\Proclamation\backend
dotnet run --project Proclamation.API/Proclamation.API.csproj
```

2. **Open Swagger**
   - Navigate to: http://localhost:5135/swagger
   - You'll see all API endpoints with a UI to test them

3. **Test Flow**:
   - Click on `POST /api/auth/request-verification`
   - Click "Try it out"
   - Enter JSON:
     ```json
     {
       "phoneNumber": "+15551234567"
     }
     ```
   - Click "Execute"
   - Should get: `{"message":"Verification code sent (dev mode)"}`

   - Click on `POST /api/auth/verify-code`
   - Click "Try it out"
   - Enter JSON:
     ```json
     {
       "phoneNumber": "+15551234567",
       "code": "123456"
     }
     ```
   - Click "Execute"
   - Should get: `{"requiresRegistration":true}`

   - Click on `POST /api/auth/register`
   - Click "Try it out"
   - Enter JSON:
     ```json
     {
       "phoneNumber": "+15551234567",
       "displayName": "John Doe",
       "role": 1
     }
     ```
   - Click "Execute"
   - Should get token and user data!

### Option 2: Use PowerShell (Direct)

```powershell
# Test 1: Request Verification
Invoke-RestMethod -Uri "http://localhost:5135/api/auth/request-verification" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"phoneNumber":"+15551234567"}'

# Test 2: Verify Code
Invoke-RestMethod -Uri "http://localhost:5135/api/auth/verify-code" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"phoneNumber":"+15551234567","code":"123456"}'

# Test 3: Register
Invoke-RestMethod -Uri "http://localhost:5135/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"phoneNumber":"+15551234567","displayName":"John Doe","role":1}'

# Test 4: Login Existing User
Invoke-RestMethod -Uri "http://localhost:5135/api/auth/verify-code" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"phoneNumber":"+15551234567","code":"123456"}'
```

### Option 3: Use curl

```bash
# Test 1: Request Verification
curl -X POST http://localhost:5135/api/auth/request-verification \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+15551234567\"}"

# Test 2: Verify Code
curl -X POST http://localhost:5135/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+15551234567\",\"code\":\"123456\"}"

# Test 3: Register
curl -X POST http://localhost:5135/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+15551234567\",\"displayName\":\"John Doe\",\"role\":1}"
```

---

## Complete Test Scenarios

### Scenario 1: New User Registration

```powershell
# Step 1: Request code
$response1 = Invoke-RestMethod -Uri "http://localhost:5135/api/auth/request-verification" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"+15551234567"}'
Write-Host "Step 1: $($response1 | ConvertTo-Json)"

# Step 2: Verify code (should require registration)
$response2 = Invoke-RestMethod -Uri "http://localhost:5135/api/auth/verify-code" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"+15551234567","code":"123456"}'
Write-Host "Step 2: $($response2 | ConvertTo-Json)"

# Step 3: Register user
$response3 = Invoke-RestMethod -Uri "http://localhost:5135/api/auth/register" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"+15551234567","displayName":"John Doe","role":1}'
Write-Host "Step 3: Token received: $($response3.token.Substring(0,20))..."
Write-Host "User: $($response3.user.displayName) (ID: $($response3.user.id))"
```

### Scenario 2: Existing User Login

```powershell
# Step 1: Request code
$response1 = Invoke-RestMethod -Uri "http://localhost:5135/api/auth/request-verification" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"+15551234567"}'

# Step 2: Verify code (should return token directly)
$response2 = Invoke-RestMethod -Uri "http://localhost:5135/api/auth/verify-code" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"+15551234567","code":"123456"}'
Write-Host "Token: $($response2.token.Substring(0,20))..."
Write-Host "Welcome back: $($response2.user.displayName)"
```

---

## Expected Responses

### 1. Request Verification
```json
{
  "message": "Verification code sent (dev mode)"
}
```

### 2. Verify Code (New User)
```json
{
  "requiresRegistration": true
}
```

### 3. Register User
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "phoneNumber": "+15551234567",
    "displayName": "John Doe",
    "role": 1,
    "familyId": null,
    "balance": 0
  }
}
```

### 4. Verify Code (Existing User)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "phoneNumber": "+15551234567",
    "displayName": "John Doe",
    "role": 1,
    "familyId": null,
    "balance": 0
  }
}
```

---

## Database Inspection

You can view the database directly:

```powershell
# Install SQLite tool
# Download from: https://www.sqlite.org/download.html

# View users
sqlite3 Proclamation.API/ProclamationDB.db "SELECT * FROM Users;"

# Count users
sqlite3 Proclamation.API/ProclamationDB.db "SELECT COUNT(*) FROM Users;"
```

---

## Troubleshooting

### "Connection refused"
- Backend not running
- Wrong port (should be 5135)
- Firewall blocking connection

### "Database locked"
- Close any SQLite browsers
- Stop all dotnet processes
- Delete `ProclamationDB.db-shm` and `ProclamationDB.db-wal` files

### "File watcher error"
- Project on Parallels shared folder
- **Solution**: Copy to `C:\Users\tygr\Desktop\`

---

## Next Steps

Once testing is complete on the local drive:

1. ✅ Backend API works
2. ✅ Mobile app runs without errors
3. ✅ Complete authentication flow working
4. Then: Implement family management features
5. Then: Add messaging with SignalR
6. Then: Build currency system
7. Then: Create chore marketplace

The foundation is solid - it just needs to be on a local Windows drive!

