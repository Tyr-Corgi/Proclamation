# Family Communication App - Proclamation

A React Native mobile app with ASP.NET Core backend that enables family messaging, in-house currency system for allowances, and a chore marketplace.

## Tech Stack

**Frontend:** React Native with TypeScript  
**Backend:** ASP.NET Core Web API with SignalR  
**Database:** SQL Server  
**Deployment:** Azure (App Service, SQL Database, SignalR Service)

## Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB or Express)
- React Native development environment (Xcode for iOS / Android Studio for Android)

### Backend Setup
```bash
cd backend
# Create database
dotnet ef database update

# Run API
dotnet run --project Proclamation.API
```

### Mobile Setup
```bash
cd ProclamationApp
npm install

# iOS
npm run ios

# Android
npm run android

# Web (for quick testing)
npm run web
```

## Development Features

- Development authentication bypass code: `123456` (any phone number)
- API running at: `http://localhost:5135`
- Mobile app with complete authentication flow

## Project Structure

- `/backend` - ASP.NET Core API
  - `Proclamation.API` - Web API project
  - `Proclamation.Core` - Domain entities
  - `Proclamation.Infrastructure` - Database context and migrations
- `/ProclamationApp` - React Native mobile app (Expo)
  - `src/types` - TypeScript type definitions
  - `src/services` - API service layer
  - `src/contexts` - React contexts (Auth, etc.)
  - `src/screens` - UI screens

## Features Implemented

### Backend (Complete ✅)
- JWT-based authentication
- Phone number verification with development bypass
- User registration and login
- SQLite database with Entity Framework Core
- RESTful API endpoints

### Mobile App (Complete ✅)
- Phone number authentication flow
- Verification code entry
- User registration (Parent/Child roles)
- Home dashboard
- Secure token storage
- Error handling and validation

### Coming Soon
- Family management (create/join families)
- Family messaging with SignalR
- In-house currency system
- Chore marketplace
- Transaction history

## Testing

See detailed testing guides:
- Backend API: `backend/API_TEST_GUIDE.md`
- Mobile App: `ProclamationApp/TESTING_GUIDE.md`

