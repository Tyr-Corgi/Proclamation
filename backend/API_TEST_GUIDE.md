# API Testing Guide

## Backend API is ready!

The backend is set up with:
- ASP.NET Core 8.0 Web API
- SQLite database (ProclamationDB.db)
- JWT Authentication
- Development bypass code for quick testing

## How to Run

```bash
cd backend
dotnet run --project Proclamation.API/Proclamation.API.csproj
```

The API will be available at:
- HTTP: http://localhost:5135
- Swagger UI: http://localhost:5135/swagger

## Authentication Endpoints

### 1. Request Verification Code (Development Bypass)
**POST** `/api/auth/request-verification`

```json
{
  "phoneNumber": "+1234567890"
}
```

Response:
```json
{
  "message": "Verification code sent (dev mode)"
}
```

### 2. Verify Code (Development Bypass: Use Code "123456")
**POST** `/api/auth/verify-code`

```json
{
  "phoneNumber": "+1234567890",
  "code": "123456"
}
```

Response (new user):
```json
{
  "requiresRegistration": true
}
```

Response (existing user):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "phoneNumber": "+1234567890",
    "displayName": "John Doe",
    "role": 1,
    "familyId": null,
    "balance": 0
  }
}
```

### 3. Register New User
**POST** `/api/auth/register`

```json
{
  "phoneNumber": "+1234567890",
  "displayName": "John Doe",
  "role": 1
}
```

Note: role = 1 (Parent), role = 2 (Child)

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "phoneNumber": "+1234567890",
    "displayName": "John Doe",
    "role": 1,
    "familyId": null,
    "balance": 0
  }
}
```

## Testing Workflow

1. Start the API: `dotnet run --project Proclamation.API/Proclamation.API.csproj`
2. Open Swagger UI: http://localhost:5135/swagger
3. Request verification for any phone number
4. Verify with code "123456"
5. If requiresRegistration is true, register the user
6. Use the JWT token for subsequent requests

## Next Steps

- Create React Native mobile app
- Build authentication screens
- Connect to this API
- Test end-to-end login flow

