# Authentication Flow Diagram

## Visual Flow Chart

```
┌─────────────────────────────────────────────────────────────────┐
│                          APP START                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  AuthProvider  │ (Check AsyncStorage for token)
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
          [No Token]               [Has Token]
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌──────────────┐
        │ Auth Navigator│        │  HomeScreen  │
        └───────┬───────┘        └──────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION FLOW                                              │
└──────────────────────────────────────────────────────────────────┘

    ┌───────────────────────┐
    │ PhoneNumberScreen     │
    │ • Enter phone number  │
    │ • Format: +1 (XXX)... │
    └──────────┬────────────┘
               │
               │ Click "Send Verification Code"
               │ POST /api/auth/request-verification
               ▼
    ┌────────────────────────────┐
    │ VerificationCodeScreen     │
    │ • Enter 6-digit code       │
    │ • Dev bypass: 123456       │
    └──────────┬─────────────────┘
               │
               │ Click "Verify"
               │ POST /api/auth/verify-code
               ▼
         ┌─────────────┐
         │  Response   │
         └──────┬──────┘
                │
    ┌───────────┴──────────────┐
    │                          │
    │ requiresRegistration:    │ token + user:
    │         true             │     present
    │                          │
    ▼                          ▼
┌────────────────────┐  ┌──────────────┐
│ RegistrationScreen │  │  HomeScreen  │
│ • Enter name       │  │ (Login       │
│ • Select role      │  │  Success!)   │
│   - Parent         │  └──────────────┘
│   - Child          │
└─────────┬──────────┘
          │
          │ Click "Complete Registration"
          │ POST /api/auth/register
          ▼
    ┌──────────────┐
    │  HomeScreen  │
    │ (Registered  │
    │  & Logged In)│
    └──────────────┘
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              AuthProvider (Context)                        │ │
│  │  • Manages user state                                      │ │
│  │  • Provides login/logout functions                         │ │
│  │  • Checks AsyncStorage on mount                            │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │           NavigationContainer                              │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │             Stack Navigator                          │ │ │
│  │  │                                                      │ │ │
│  │  │  if isAuthenticated:                                │ │ │
│  │  │    → HomeScreen                                     │ │ │
│  │  │                                                      │ │ │
│  │  │  else:                                               │ │ │
│  │  │    → AuthNavigator                                  │ │ │
│  │  │       ├── PhoneNumberScreen                         │ │ │
│  │  │       ├── VerificationCodeScreen                    │ │ │
│  │  │       └── RegistrationScreen                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## API Service Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    apiService (Singleton)                        │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │ All requests go through Axios instance
               │
               ▼
    ┌──────────────────────┐
    │  Request Interceptor │
    │  • Load token from   │
    │    AsyncStorage      │
    │  • Add to headers:   │
    │    Authorization:    │
    │    Bearer <token>    │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │   Backend API        │
    │   localhost:5135     │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │   Response           │
    │   • Success: Data    │
    │   • Error: Message   │
    └──────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      AuthContext State                           │
└─────────────────────────────────────────────────────────────────┘

  State:
  ┌────────────────────────────────────────────────────────────┐
  │ • user: User | null                                        │
  │ • isLoading: boolean                                       │
  │ • isAuthenticated: boolean (computed from !!user)          │
  └────────────────────────────────────────────────────────────┘

  Actions:
  ┌────────────────────────────────────────────────────────────┐
  │ • login(user: User)                                        │
  │   → Set user state                                         │
  │   → Token already stored by apiService                     │
  │                                                            │
  │ • logout()                                                 │
  │   → Clear user state                                       │
  │   → apiService.logout() → Clear AsyncStorage               │
  └────────────────────────────────────────────────────────────┘

  Effect on Mount:
  ┌────────────────────────────────────────────────────────────┐
  │ • Check for stored token in AsyncStorage                   │
  │ • If found → Consider authenticated                        │
  │ • Set isLoading = false                                    │
  └────────────────────────────────────────────────────────────┘
```

## Data Flow: New User Registration

```
User                Screen                  API Service           Backend
  │                   │                         │                   │
  │  Enter phone      │                         │                   │
  ├──────────────────>│                         │                   │
  │                   │  requestVerification()  │                   │
  │                   ├────────────────────────>│  POST /request-   │
  │                   │                         ├──────verification>│
  │                   │                         │<──────────────────┤
  │                   │<────────────────────────┤  {message}        │
  │                   │                         │                   │
  │                   │  [Show Verification     │                   │
  │                   │   Code Screen]          │                   │
  │                   │                         │                   │
  │  Enter code       │                         │                   │
  │  (123456)         │                         │                   │
  ├──────────────────>│                         │                   │
  │                   │  verifyCode()           │                   │
  │                   ├────────────────────────>│  POST /verify-    │
  │                   │                         ├──────code──────>  │
  │                   │                         │<──────────────────┤
  │                   │<────────────────────────┤  {requires        │
  │                   │  {requiresRegistration} │   Registration:   │
  │                   │                         │   true}           │
  │                   │  [Show Registration     │                   │
  │                   │   Screen]               │                   │
  │                   │                         │                   │
  │  Enter name +     │                         │                   │
  │  select role      │                         │                   │
  ├──────────────────>│                         │                   │
  │                   │  register()             │                   │
  │                   ├────────────────────────>│  POST /register   │
  │                   │                         ├──────────────────>│
  │                   │                         │  Store token──────┤
  │                   │                         │<──────────────────┤
  │                   │<────────────────────────┤  {token, user}    │
  │                   │  login(user)            │                   │
  │                   ├────────────────────────>│                   │
  │                   │  [AuthContext]          │                   │
  │                   │                         │                   │
  │                   │  [Navigate to Home]     │                   │
  │<──────────────────┤                         │                   │
  │  View Home Screen │                         │                   │
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Token Lifecycle                               │
└─────────────────────────────────────────────────────────────────┘

1. Login/Registration
   ┌────────────────────────────────────────────────┐
   │ Backend generates JWT token                    │
   │        ↓                                       │
   │ apiService receives token                      │
   │        ↓                                       │
   │ apiService.setToken(token)                     │
   │        ↓                                       │
   │ Store in AsyncStorage                          │
   │        ↓                                       │
   │ Store in memory (this.token)                   │
   └────────────────────────────────────────────────┘

2. Subsequent Requests
   ┌────────────────────────────────────────────────┐
   │ Request Interceptor                            │
   │        ↓                                       │
   │ Check memory: this.token                       │
   │        ↓                                       │
   │ If null, load from AsyncStorage                │
   │        ↓                                       │
   │ Add to Authorization header                    │
   │        ↓                                       │
   │ Backend validates token                        │
   └────────────────────────────────────────────────┘

3. App Restart
   ┌────────────────────────────────────────────────┐
   │ AuthContext checkAuthStatus()                  │
   │        ↓                                       │
   │ apiService.getStoredToken()                    │
   │        ↓                                       │
   │ Read from AsyncStorage                         │
   │        ↓                                       │
   │ If found → Consider authenticated              │
   └────────────────────────────────────────────────┘

4. Logout
   ┌────────────────────────────────────────────────┐
   │ User clicks logout                             │
   │        ↓                                       │
   │ AuthContext.logout()                           │
   │        ↓                                       │
   │ apiService.logout()                            │
   │        ↓                                       │
   │ Clear memory: this.token = null                │
   │        ↓                                       │
   │ Remove from AsyncStorage                       │
   │        ↓                                       │
   │ Clear user state                               │
   │        ↓                                       │
   │ Navigate to Auth screens                       │
   └────────────────────────────────────────────────┘
```

## Error Handling Flow

```
API Call → Try/Catch Block → Error?
                                │
                    ┌───────────┴───────────┐
                    │                       │
                   Yes                     No
                    │                       │
                    ▼                       ▼
          ┌──────────────────┐    ┌──────────────┐
          │ Catch Block      │    │ Success!     │
          │ • Log error      │    │ • Process    │
          │ • Show Alert     │    │   data       │
          │ • Set loading    │    │ • Update UI  │
          │   false          │    │ • Navigate   │
          └──────────────────┘    └──────────────┘
```

## Screen Transitions

```
PhoneNumberScreen
        │
        │ onVerificationSent(phoneNumber)
        │ [Store phoneNumber in state]
        ▼
VerificationCodeScreen
        │
        ├── onBack() → PhoneNumberScreen
        │
        │ onVerified(response)
        │ [Check response]
        │
        ├── requiresRegistration: true
        │   [Set needsRegistration state]
        │   ▼
        │   RegistrationScreen
        │           │
        │           │ onRegistered(response)
        │           │ [Login with user data]
        │           ▼
        │       HomeScreen
        │
        └── requiresRegistration: false
            [Login with user data]
            ▼
            HomeScreen
```

This diagram shows the complete authentication flow, from app start to successful login, with all the interactions between components, API service, and backend.

