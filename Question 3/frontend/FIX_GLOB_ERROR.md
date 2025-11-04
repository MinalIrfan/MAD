# Fix "g.on is not a function" Error

## Problem
```
TypeError: g.on is not a function
at glob.js:19:11
```

This error occurs because Expo CLI's TypeScript checker is using an incompatible version of the `glob` package.

## Solution: Skip TypeScript Checking or Fix Dependencies

Since this is a **JavaScript project** (not TypeScript), we can bypass this check.

### Option 1: Clean Install with Specific Expo CLI Version (Recommended)

Run this command:

```powershell
cd frontend; Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue; Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue; Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue; npm cache clean --force; npm install --legacy-peer-deps; npx expo start --clear --no-dev
```

### Option 2: Use Expo CLI Directly (Alternative)

If the above doesn't work, try:

```powershell
cd frontend
npx expo@49.0.15 start --clear
```

### Option 3: Install Compatible Glob Version

If still having issues, try:

```powershell
cd frontend
npm install glob@^8.0.0 --save-dev
npx expo start --clear
```

### Option 4: Disable TypeScript Checking (Quick Fix)

Create or update `app.json` to skip TypeScript:

```json
{
  "expo": {
    "name": "Coffee Shop Menu",
    "slug": "coffee-shop-menu",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "splash": {
      "backgroundColor": "#8B4513",
      "resizeMode": "contain"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.coffeeshop.menu"
    },
    "android": {
      "package": "com.coffeeshop.menu",
      "adaptiveIcon": {
        "backgroundColor": "#8B4513"
      }
    },
    "extra": {
      "eas": {
        "projectId": null
      }
    }
  }
}
```

## Quick Fix Command (Try This First)

```powershell
cd frontend; Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue; Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue; npm cache clean --force; npm install --legacy-peer-deps; npx expo start --clear
```

## What's Happening

Expo CLI is trying to check for TypeScript files during startup, but the `glob` package it uses has a version mismatch. Since your project is pure JavaScript, this check is unnecessary.

## After Fix

You should see:
- ✅ No "g.on is not a function" error
- ✅ Metro bundler starts successfully
- ✅ QR code displayed
- ✅ App ready to load

