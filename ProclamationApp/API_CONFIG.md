# API Configuration Guide

## Updating the API Base URL

The mobile app needs to connect to your backend API. The URL varies depending on where you're running the app.

### Location to Update

File: `src/services/api.service.ts`

Look for this line:
```typescript
const API_BASE_URL = 'http://localhost:5135';
```

### Configuration by Platform

#### iOS Simulator
```typescript
const API_BASE_URL = 'http://localhost:5135';
```
✅ This is the default and works out of the box.

#### Android Emulator
```typescript
const API_BASE_URL = 'http://10.0.2.2:5135';
```
⚠️ Android emulator uses `10.0.2.2` as an alias for `localhost` on your computer.

#### Physical iOS/Android Device
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5135';
```

Example:
```typescript
const API_BASE_URL = 'http://192.168.1.100:5135';
```

**How to find your computer's IP:**

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```
Look for the IP address (usually starts with 192.168.x.x or 10.x.x.x).

**Important:** 
- Your phone/device must be on the same WiFi network as your computer
- Your firewall must allow connections on port 5135
- The backend API must be running

### Verifying Backend is Running

Before running the mobile app, ensure your backend is running:

```bash
cd backend
dotnet run --project Proclamation.API/Proclamation.API.csproj
```

You should see output like:
```
Now listening on: http://localhost:5135
```

Test it in your browser: `http://localhost:5135/swagger`

### Testing the Connection

If the mobile app can't connect to the API, you'll see "Network Error" messages.

**Quick Test:**
1. Make sure backend is running
2. Update API_BASE_URL for your platform
3. Restart the mobile app (reload won't pick up changes to this file)
4. Try to login - if you get past the phone entry screen, it's working!

### Production Configuration

For production, you would:
1. Deploy your backend to Azure App Service (or similar)
2. Update API_BASE_URL to your production URL (e.g., `https://proclamation-api.azurewebsites.net`)
3. Remove the development bypass code
4. Implement proper environment variables using `@react-native-community/config` or similar

### Environment Variables (Future Enhancement)

Consider using environment variables for different configurations:

```typescript
const API_BASE_URL = __DEV__ 
  ? Platform.select({
      ios: 'http://localhost:5135',
      android: 'http://10.0.2.2:5135',
    })
  : 'https://proclamation-api.azurewebsites.net';
```

