# Running on Expo Go - Step by Step Guide

This app is **100% compatible with Expo Go** and uses only standard React Native components that work in Expo Go.

## Prerequisites

1. **Install Expo Go on your phone:**
   - **iOS**: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - **Android**: Download from [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Make sure your phone and computer are on the same Wi-Fi network**

## Step-by-Step Setup

### Step 1: Start Backend Server

Open **Terminal 1** (PowerShell):

```powershell
cd backend
npm start
```

Wait until you see:
- ✅ "Connected to MongoDB"
- ✅ "Coffee shop server running on port 3000"

**Keep this terminal running!**

### Step 2: Configure API URL for Your Phone

1. Open `frontend/App.js`
2. Find line 17: `const API_BASE_URL = 'http://localhost:3000';`
3. **Find your computer's IP address:**
   - In PowerShell, run: `ipconfig`
   - Look for "IPv4 Address" (usually something like `192.168.1.100`)
4. **Update the API URL:**
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000';
   // Example: const API_BASE_URL = 'http://192.168.1.100:3000';
   ```
5. **Save the file**

### Step 3: Install Frontend Dependencies (First Time Only)

Open **Terminal 2** (PowerShell):

```powershell
cd frontend
npm install
```

### Step 4: Start Expo Development Server

In **Terminal 2** (still in frontend folder):

```powershell
npx expo start
```

You should see:
- 🎯 **QR Code** displayed in terminal
- Options to press keys (a, i, w, etc.)

### Step 5: Open in Expo Go on Your Phone

**Option A: Scan QR Code (Recommended)**
1. Open **Expo Go** app on your phone
2. Tap **"Scan QR code"**
3. Scan the QR code from your terminal
4. App will load automatically!

**Option B: Use Expo Go's Connection Tab**
1. Open **Expo Go** app on your phone
2. The app should appear in the "Recent projects" if on same network
3. Tap to open

## Testing the App

Once the app loads in Expo Go:

1. **Tap "Full Menu"** button
   - Should display all 6 menu items
   - Check that Muffin shows "Out of Stock"

2. **Tap "Surprise Me"** button
   - Should display one random in-stock item
   - Tap again to get different random item
   - Muffin should never appear (it's out of stock)

## Troubleshooting

### ❌ "Cannot connect to server" error

**Fix:**
1. ✅ Make sure backend is running (Terminal 1)
2. ✅ Check API_BASE_URL in `App.js` has your computer's IP (not localhost)
3. ✅ Verify phone and computer are on same Wi-Fi
4. ✅ Test backend in phone's browser: `http://YOUR_IP:3000/menu`
5. ✅ Check Windows Firewall - allow Node.js through firewall

### ❌ QR Code not scanning

**Fix:**
1. ✅ Make sure Expo Go app is installed
2. ✅ Try typing `s` in Expo terminal to switch to LAN connection
3. ✅ Check both devices on same Wi-Fi network
4. ✅ Try manually entering the connection URL shown in terminal

### ❌ App crashes or shows blank screen

**Fix:**
1. ✅ Make sure backend server is running
2. ✅ Check API_BASE_URL is correct
3. ✅ Restart Expo: Press `r` in terminal to reload
4. ✅ Clear cache: `npx expo start --clear`

### ❌ "Network request failed"

**Fix:**
1. ✅ Update `API_BASE_URL` with your computer's IP address
2. ✅ Test backend in phone's browser first
3. ✅ Disable VPN if using one
4. ✅ Check firewall settings

## Verifying Backend is Accessible

Before opening Expo Go, test if your phone can reach the backend:

1. On your phone's browser, open: `http://YOUR_COMPUTER_IP:3000/menu`
2. You should see JSON data with menu items
3. If this works, Expo Go will also work!

## Quick Checklist

Before opening in Expo Go:
- [ ] Backend server running (`cd backend && npm start`)
- [ ] MongoDB connected (see "Connected to MongoDB" message)
- [ ] API_BASE_URL updated with your computer's IP in `App.js`
- [ ] Phone and computer on same Wi-Fi
- [ ] Expo Go app installed on phone
- [ ] Expo server started (`npx expo start` in frontend folder)

## What This App Uses (Expo Go Compatible)

✅ React Native core components (TouchableOpacity, FlatList, etc.)
✅ Fetch API for network requests
✅ Expo SDK 49 (fully supported by Expo Go)
✅ Standard React hooks (useState)

This app is **100% compatible with Expo Go** - no custom native modules needed!

