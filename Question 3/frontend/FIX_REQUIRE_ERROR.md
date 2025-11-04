# Fix "require doesn't exist" Error

## Problem
```
ReferenceError: property 'require' doesn't exist
```

This error occurs due to version mismatches between Expo, React, and React Native.

## Solution: Fix Version Compatibility

The package.json had incompatible versions. This has been fixed.

## Steps to Fix

### 1. Clean Everything

```powershell
cd frontend

# Remove all files
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Recurse -Force .expo
```

### 2. Clear Metro Cache

```powershell
npm cache clean --force
```

### 3. Reinstall Dependencies

```powershell
npm install
```

### 4. Start with Clear Cache

```powershell
npx expo start --clear
```

## All-in-One Fix Command

Copy and paste this entire command:

```powershell
cd frontend; Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue; Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue; Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue; npm cache clean --force; npm install; npx expo start --clear
```

## What Was Fixed

- ✅ Changed `expo` from `^54.0.22` to `~49.0.15` (compatible version)
- ✅ Changed `react-native` from `^0.72.17` to `0.72.6` (exact version for Expo 49)
- ✅ Kept `react` at `18.2.0` (correct for Expo 49)

## Version Compatibility

For Expo SDK 49:
- `expo`: ~49.0.15
- `react`: 18.2.0
- `react-native`: 0.72.6
- `babel-preset-expo`: ~9.5.0

## After Running

You should see:
- ✅ No "require" errors
- ✅ Expo starts successfully
- ✅ QR code displayed
- ✅ App loads in Expo Go

## If Error Persists

1. Try restarting Expo Go app on your phone
2. Try clearing Expo Go cache: Settings > Clear Cache
3. Try using tunnel mode: `npx expo start --tunnel`
4. Make sure you're using the latest Expo Go app from App Store/Play Store

