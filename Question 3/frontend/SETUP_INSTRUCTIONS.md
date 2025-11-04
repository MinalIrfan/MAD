# Frontend Setup Instructions

## Fix Expo Setup Issues

The frontend had compatibility issues. Follow these steps:

### Step 1: Clean Installation

Open PowerShell in the `frontend` folder and run:

```powershell
# Remove old dependencies
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Fresh install
npm install
```

### Step 2: Start Expo

After installation completes, start Expo:

```powershell
npx expo start
```

### Step 3: Run on Device/Emulator

Once Expo starts, you'll see:
- A QR code
- Options to press:
  - `a` for Android emulator
  - `i` for iOS simulator (Mac only)
  - Scan QR code with Expo Go app on your phone

### Important Notes

1. **Backend must be running first:**
   - Open a separate terminal
   - Run: `cd backend && npm start`
   - Make sure you see "Connected to MongoDB" and "Coffee shop server running on port 3000"

2. **If testing on physical device:**
   - Make sure your phone and computer are on the same Wi-Fi
   - Update `API_BASE_URL` in `App.js` from `localhost` to your computer's IP address
   - Find your IP: In PowerShell run `ipconfig` and look for IPv4 address

3. **If you get errors:**
   - Try: `npx expo start --clear` to clear cache
   - Make sure Node.js version is compatible (v14-v18 recommended)

## Troubleshooting

### Error: "Cannot connect to server"
- Make sure backend is running on port 3000
- Check firewall settings
- For physical device, update API_BASE_URL with your computer's IP

### Error: "Expo not starting"
- Clear cache: `npx expo start --clear`
- Reinstall: Delete `node_modules` and `package-lock.json`, then `npm install`

### Error: "Module not found"
- Run `npm install` again
- Make sure you're in the `frontend` directory

