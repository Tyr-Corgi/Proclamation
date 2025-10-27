# Mobile App Testing Guide

## Prerequisites

Before testing, ensure you have:

1. **Backend API Running**
   ```bash
   cd backend
   dotnet run --project Proclamation.API/Proclamation.API.csproj
   ```
   API should be running at: `http://localhost:5135`

2. **Mobile Dependencies Installed**
   ```bash
   cd ProclamationApp
   npm install
   ```

## Configuration

### API Base URL Configuration

The API URL in `src/services/api.service.ts` needs to be adjusted based on your device:

- **iOS Simulator**: `http://localhost:5135` (default)
- **Android Emulator**: `http://10.0.2.2:5135`
- **Physical Device**: `http://YOUR_COMPUTER_IP:5135` (e.g., `http://192.168.1.100:5135`)

To find your computer's IP:
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `ifconfig` or `ip addr`

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web (for quick testing)
```bash
npm run web
```

## Testing Authentication Flow

### Test Case 1: New User Registration

1. **Start the app**
   - You should see the "Welcome to Proclamation" screen

2. **Enter phone number**
   - Enter any phone number (e.g., `+1 (234) 567-8901`)
   - Click "Send Verification Code"
   - You should see "Verification code sent (dev mode)" message

3. **Enter verification code**
   - Enter the development bypass code: `123456`
   - Click "Verify"
   - Since this is a new user, you should be taken to the registration screen

4. **Complete registration**
   - Enter your name (e.g., "John Doe")
   - Select role: "Parent" or "Child"
   - Click "Complete Registration"
   - You should be logged in and see the home screen

5. **Verify home screen**
   - Your name, phone number, role, and balance should be displayed
   - You should see the "Coming Soon" features list
   - The logout button should be visible

### Test Case 2: Existing User Login

1. **Start the app** (or logout if already logged in)

2. **Enter the same phone number** from Test Case 1

3. **Enter verification code**: `123456`

4. **You should be logged in directly** (skip registration)
   - Should go straight to home screen
   - Your previously saved information should be displayed

### Test Case 3: Back Navigation

1. **Enter a phone number**
2. **On the verification code screen, click "← Back"**
   - Should return to phone number entry screen
   - You can enter a different phone number

### Test Case 4: Logout and Re-login

1. **From the home screen, click "Logout"**
   - Should return to phone number entry screen
   - Auth token should be cleared

2. **Log back in** with the same credentials
   - Follow the login flow again
   - Should restore your session

## Expected Behavior

### Development Mode Features
- Any phone number is accepted
- Verification code `123456` always works
- No actual SMS is sent

### Error Handling
- Invalid phone numbers show error alert
- Incomplete verification codes show error alert
- Registration without name/role shows error alert
- Network errors show appropriate error messages

## Troubleshooting

### "Network Error" or "Request Failed"

**Problem**: App can't connect to the backend API

**Solutions**:
1. Verify the backend is running at `http://localhost:5135`
2. Check the API_BASE_URL in `src/services/api.service.ts`
3. For Android emulator, use `http://10.0.2.2:5135`
4. For physical devices, use your computer's IP address
5. Ensure your device and computer are on the same WiFi network (for physical devices)
6. Check if firewall is blocking the connection

### "Verification Failed"

**Problem**: Verification code not working

**Solution**: Make sure you're using the development bypass code: `123456`

### App Crashes or White Screen

**Solutions**:
1. Reload the app (shake device and press "Reload")
2. Clear the app cache
3. Check the terminal for error messages
4. Verify all dependencies are installed: `npm install`

### TypeScript Errors

**Solution**: Run `npm install` to ensure all TypeScript types are properly installed

## Testing Checklist

- [ ] Backend API is running
- [ ] Mobile app starts without errors
- [ ] Can enter phone number
- [ ] Can request verification code
- [ ] Can enter verification code (123456)
- [ ] Can complete registration for new users
- [ ] Can login as existing user
- [ ] Home screen displays user information
- [ ] Logout works correctly
- [ ] Can log back in after logout
- [ ] Back navigation works
- [ ] Error messages display appropriately

## Next Features to Test (Coming Soon)

Once implemented, test:
- [ ] Family creation and joining
- [ ] Family messaging
- [ ] Currency transactions
- [ ] Chore marketplace
- [ ] Push notifications

## API Endpoints Used

The app uses these backend endpoints:

1. `POST /api/auth/request-verification` - Request verification code
2. `POST /api/auth/verify-code` - Verify code and check if user exists
3. `POST /api/auth/register` - Register new user

Refer to `backend/API_TEST_GUIDE.md` for detailed API documentation.

