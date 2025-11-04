# Complete Fix for "require doesn't exist" Error

## Root Cause Analysis

The error `ReferenceError: Property 'require' doesn't exist` occurs due to **version incompatibility** between Expo SDK and React Native.

### What Happened:

Your `package.json` had:
- `expo: ^54.0.22` (requires React Native 0.76+ and React 19+)
- `react-native: ^0.72.17` (incompatible with Expo 54)
- `react: 18.2.0` (incompatible with Expo 54)

**Expo SDK 54 requires:**
- React Native 0.76+
- React 19+

**But you have:**
- React Native 0.72.17
- React 18.2.0

This mismatch causes the JavaScript runtime to fail when trying to load modules.

## Solution: Use Compatible Versions (Expo SDK 49)

I've fixed your `package.json` to use Expo SDK 49, which is compatible with:
- React Native 0.72.6
- React 18.2.0

### Updated package.json:

```json
{
  "dependencies": {
    "expo": "~49.0.15",
    "react": "18.2.0",
    "react-native": "0.72.6"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "babel-preset-expo": "~9.5.0"
  }
}
```

## All Possible Reasons for This Error

### 1. **Version Mismatch (YOUR CASE)**
- **Problem:** Expo SDK version doesn't match React Native/React versions
- **Fix:** Use compatible versions (see above)

### 2. **Using `require()` in Frontend Code**
- **Problem:** Using CommonJS `require()` instead of ES modules `import`
- **Fix:** Convert all `require()` to `import` statements
- **Status:** ✅ Your `App.js` already uses ES modules correctly

### 3. **Babel Configuration Issues**
- **Problem:** Missing or incorrect `babel.config.js`
- **Fix:** Ensure `babel-preset-expo` is in presets
- **Status:** ✅ Your `babel.config.js` is correct

### 4. **Corrupted Cache**
- **Problem:** Metro bundler cache is corrupted
- **Fix:** Clear all caches and reinstall

### 5. **Node.js Modules in Frontend**
- **Problem:** Trying to import Node.js-specific modules (fs, path, http, etc.)
- **Fix:** Don't use Node.js modules in React Native code
- **Status:** ✅ Your code doesn't use Node.js modules

### 6. **Dependency Issues**
- **Problem:** Transitive dependencies using incompatible `require()` patterns
- **Fix:** Clean install with correct versions

## Step-by-Step Fix

### Step 1: Clean Everything

Run this command in PowerShell:

```powershell
cd frontend

# Remove all old files
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force
```

### Step 2: Reinstall Dependencies

```powershell
npm install
```

### Step 3: Start Expo with Clear Cache

```powershell
npx expo start --clear
```

## All-in-One Command

Copy and paste this entire command:

```powershell
cd frontend; Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue; Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue; Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue; npm cache clean --force; npm install; npx expo start --clear
```

## Verification Checklist

After running the fix, verify:

- [ ] No "require doesn't exist" error
- [ ] Expo starts successfully
- [ ] QR code is displayed
- [ ] App loads in Expo Go
- [ ] No red error screen

## Your App.js Status

✅ **Already Using ES Modules:**
- All imports use `import ... from ...` syntax
- No `require()` statements found
- No Node.js modules imported
- Proper React Native components only

**Your App.js is correct!** The issue was only the version mismatch.

## Version Compatibility Reference

### Expo SDK 49 (Recommended for this project):
```json
{
  "expo": "~49.0.15",
  "react": "18.2.0",
  "react-native": "0.72.6",
  "babel-preset-expo": "~9.5.0"
}
```

### Expo SDK 54 (If you want to upgrade later):
```json
{
  "expo": "~54.0.0",
  "react": "19.0.0",
  "react-native": "0.76.0",
  "babel-preset-expo": "~12.0.0"
}
```

**Note:** Upgrading to Expo 54 requires rewriting your entire app for React 19, which is not recommended now.

## After Fix

1. **Backend must be running:**
   ```powershell
   cd backend
   npm start
   ```

2. **Update API URL in App.js:**
   - Line 18: Change `http://192.168.56.1:3000` to your computer's IP
   - Find IP: Run `ipconfig` in PowerShell

3. **Test the app:**
   - Scan QR code with Expo Go
   - Tap "Full Menu" button
   - Tap "Surprise Me" button
   - Verify both work correctly

## If Error Persists

1. **Check Expo Go version:**
   - Update Expo Go app from App Store/Play Store
   - Must support Expo SDK 49

2. **Try tunnel mode:**
   ```powershell
   npx expo start --tunnel
   ```

3. **Restart Expo Go:**
   - Close Expo Go completely
   - Reopen and scan QR code again

4. **Check backend:**
   - Make sure backend is running on port 3000
   - Test: Open `http://localhost:3000/menu` in browser

## Summary

- ✅ **Fixed:** Version mismatch in `package.json`
- ✅ **Verified:** `App.js` uses ES modules correctly
- ✅ **Verified:** `babel.config.js` is correct
- ✅ **No require() statements** found in your code

The error should be completely resolved after running the clean install command!

