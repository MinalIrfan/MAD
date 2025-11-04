# React Native Expo Mobile App Setup

This is a **React Native Expo mobile application** for iOS and Android devices.

## Quick Start

### 1. Install Dependencies
```powershell
cd frontend
npm install
```

### 2. Start Expo Development Server
```powershell
npx expo start
```

### 3. Run on Mobile Device/Emulator

**Option A: Physical Device (Recommended for Testing)**
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Make sure your phone and computer are on the **same Wi-Fi network**
3. Scan the QR code shown in terminal with Expo Go app
4. **Important**: Update `API_BASE_URL` in `App.js` with your computer's IP address
   - Find your IP: Run `ipconfig` in PowerShell (look for IPv4 Address)
   - Example: `const API_BASE_URL = 'http://192.168.1.100:3000';`

**Option B: Android Emulator**
1. Install Android Studio and set up an emulator
2. Press `a` in the Expo terminal to open in Android emulator
3. Use `http://localhost:3000` or `http://10.0.2.2:3000` in `App.js`

**Option C: iOS Simulator (Mac only)**
1. Install Xcode
2. Press `i` in the Expo terminal to open in iOS simulator
3. Use `http://localhost:3000` in `App.js`

## API Configuration for Mobile

The app needs to connect to your backend server. Update `API_BASE_URL` in `frontend/App.js`:

### For Emulator (Android/iOS):
```javascript
const API_BASE_URL = 'http://localhost:3000';
// For Android emulator, you can also use:
// const API_BASE_URL = 'http://10.0.2.2:3000';
```

### For Physical Device:
```javascript
// Replace with your computer's IP address
const API_BASE_URL = 'http://192.168.1.100:3000';
```

### Finding Your Computer's IP Address:

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Mac/Linux:**
```bash
ifconfig
# Look for "inet" address (usually starts with 192.168.x.x)
```

## Backend Server Setup

**Before running the mobile app, make sure your backend is running:**

1. Open a **separate terminal**
2. Navigate to backend:
   ```powershell
   cd backend
   npm start
   ```
3. You should see:
   - "Connected to MongoDB"
   - "Coffee shop server running on port 3000"

## Testing the Mobile App

1. **Full Menu Button**: Taps to show all menu items from database
2. **Surprise Me Button**: Taps to show one random in-stock item

## Features

✅ React Native mobile app (iOS & Android)
✅ Expo development environment
✅ Touch-friendly UI with buttons
✅ Menu display with stock status
✅ Error handling and loading states
✅ Connects to Node.js backend API

## Troubleshooting

### Cannot connect to server on physical device:
- ✅ Make sure backend is running (`cd backend && npm start`)
- ✅ Check that phone and computer are on same Wi-Fi
- ✅ Update `API_BASE_URL` with your computer's IP (not localhost)
- ✅ Check Windows Firewall - allow Node.js through firewall
- ✅ Verify backend server is accessible: Open `http://YOUR_IP:3000/menu` in phone's browser

### Expo not starting:
- ✅ Clear cache: `npx expo start --clear`
- ✅ Reinstall: Delete `node_modules` and run `npm install`

### App crashes or shows errors:
- ✅ Make sure backend is running and accessible
- ✅ Check API_BASE_URL is correct
- ✅ Verify MongoDB connection is working (check backend terminal)

## Mobile App Structure

- `App.js` - Main React Native component with menu display
- `app.json` - Expo configuration for iOS/Android
- Uses React Native components:
  - `TouchableOpacity` for buttons
  - `FlatList` for menu items
  - `SafeAreaView` for proper mobile layout
  - `Alert` for error messages

