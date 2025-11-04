# Fix Expo WebSocket Error

## Problem
```
TypeError: this._server.once is not a function
```

This error occurs due to incompatible dependencies from `npm audit fix --force`.

## Solution: Clean Reinstall

Run these commands in PowerShell (in the `frontend` folder):

```powershell
cd frontend

# Remove all old dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Fresh install
npm install

# Start Expo
npx expo start
```

## Alternative: If Above Doesn't Work

If the error persists, try using Expo CLI directly:

```powershell
cd frontend

# Remove node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Install with specific Expo version
npm install expo@~49.0.15 react@18.2.0 react-native@0.72.6

# Install babel
npm install --save-dev @babel/core

# Start with tunnel (works better for some networks)
npx expo start --tunnel
```

## If Still Getting Errors

Try clearing all caches:

```powershell
cd frontend

# Clear npm cache
npm cache clean --force

# Remove everything
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Recurse -Force .expo

# Fresh install
npm install

# Start Expo
npx expo start --clear
```

## Quick Fix Command (Copy & Paste All At Once)

```powershell
cd frontend; Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue; Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue; Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue; npm cache clean --force; npm install; npx expo start --clear
```

