# Clean Install - Fix Expo CLI Error

The old `expo-cli` package is causing errors. Follow these steps to fix it.

## Step 1: Clean Everything

In PowerShell, run these commands:

```powershell
cd frontend

# Remove all old files
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force
```

## Step 2: Fresh Install

```powershell
# Install dependencies
npm install
```

## Step 3: Start Expo

```powershell
# Use npx expo (not expo-cli)
npx expo start
```

## All-in-One Command

Copy and paste this entire command:

```powershell
cd frontend; Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue; Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue; Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue; npm cache clean --force; npm install; npx expo start
```

## What Changed

- ✅ Updated `package.json` scripts to use `npx expo` instead of old `expo-cli`
- ✅ This uses the modern Expo CLI (comes with expo package)
- ✅ Compatible with Node.js v20

## After Running

You should see:
- ✅ No warnings about expo-cli
- ✅ QR code displayed
- ✅ Options to scan QR code or press keys

## If Still Getting Errors

Try using tunnel mode (works better for some networks):

```powershell
npx expo start --tunnel
```

Or clear cache:

```powershell
npx expo start --clear
```

