# 🚀 Quick Start Guide

## TL;DR - Get Running in 3 Minutes

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
dotnet run --project Proclamation.API/Proclamation.API.csproj
```
✅ Wait for: `Now listening on: http://localhost:5135`

### Step 2: Install & Run Mobile App (Terminal 2)
```bash
cd ProclamationApp
npm install
npm run ios        # or npm run android, or npm run web
```

### Step 3: Test Login
1. Enter any phone number
2. Use code: **123456**
3. Fill in your name and select a role
4. You're in! 🎉

---

## 📱 Platform-Specific Setup

### Running on iOS Simulator ✅
- **No changes needed!** Works out of the box
- Command: `npm run ios`

### Running on Android Emulator ⚠️
- **Change required** in `src/services/api.service.ts`:
  ```typescript
  const API_BASE_URL = 'http://10.0.2.2:5135';
  ```
- Command: `npm run android`

### Running on Physical Device 📱
- **Find your computer's IP**:
  - Windows: `ipconfig` (look for IPv4)
  - Mac/Linux: `ifconfig` or `ip addr`
- **Update** `src/services/api.service.ts`:
  ```typescript
  const API_BASE_URL = 'http://YOUR_IP:5135';  // e.g., http://192.168.1.100:5135
  ```
- **Ensure**: Same WiFi network for both devices
- Command: `npm run ios` or `npm run android`

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Network Error"** | 1. Backend running? 2. Check API_BASE_URL 3. Same WiFi? |
| **"Verification Failed"** | Use code: `123456` |
| **White Screen** | Reload app (shake device → Reload) |
| **Dependencies error** | Run `npm install` again |
| **Port 5135 in use** | Kill process or change port in backend |

---

## 📚 More Documentation

- **Complete Testing Guide**: `TESTING_GUIDE.md`
- **API Configuration**: `API_CONFIG.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Flow Diagrams**: `AUTH_FLOW_DIAGRAM.md`
- **Backend API Docs**: `../backend/API_TEST_GUIDE.md`

---

## 🎯 What You Can Do Right Now

✅ **Working Features:**
- Phone number authentication
- User registration
- Login for returning users
- View user profile
- Logout

🚧 **Coming Soon:**
- Family management
- Messaging
- Currency system
- Chore marketplace

---

## 🔑 Key Files

- `App.tsx` - Main app entry, navigation setup
- `src/services/api.service.ts` - API calls, change URL here
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/screens/` - All UI screens

---

## 💡 Pro Tips

1. **Quick restart**: Use `npm run start:clear` to clear cache
2. **Test on web first**: `npm run web` for fastest development
3. **Check logs**: Look at terminal for error messages
4. **Backend swagger**: Visit `http://localhost:5135/swagger` to test API

---

## ✨ Default Test Credentials

- **Phone**: Any number (e.g., `+1 (555) 123-4567`)
- **Code**: `123456` (development bypass)
- **Name**: Whatever you want
- **Role**: Parent or Child

---

**That's it!** You're ready to go. Happy coding! 🎉

