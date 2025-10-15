# SkillSwap - Mobile Learning Platform

A React Native mobile application built with Expo that connects people who want to learn new skills with those who can teach them.

## Features

- **Authentication**: Email/password login and signup with dummy credentials
- **Home Feed**: Browse available skill offerings in a clean card layout
- **Create Posts**: Share your skills with the community through a simple form
- **Profile**: View user information, skills, and statistics
- **Tab Navigation**: Easy navigation between main sections

## Tech Stack

- **React Native** with **Expo SDK 53.0.0**
- **Expo Router** for navigation
- **TypeScript** for type safety
- **Lucide React Native** for icons
- Native styling with StyleSheet

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd skillswap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the app:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your device

## Demo Credentials

For testing the login functionality, use these credentials:
- **Email**: user@skillswap.com
- **Password**: password123

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   └── login.tsx          # Login/Signup screen
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Tab navigation layout
│   │   ├── index.tsx          # Home feed screen
│   │   ├── create.tsx         # Create post screen
│   │   └── profile.tsx        # Profile screen
│   ├── _layout.tsx            # Root layout
│   └── index.tsx              # App entry point
├── components/
│   └── SkillCard.tsx          # Reusable skill card component
├── hooks/
│   └── useFrameworkReady.ts   # Framework initialization hook
└── assets/                    # Static assets
```

## Screens Overview

### 1. Login/Signup Screen
- Email and password authentication
- Toggle between login and signup modes
- Form validation and error handling
- Demo credentials display for testing

### 2. Home Feed Screen
- Displays skill offerings in card format
- Shows tutor name, skill title, description, and category
- Clean, scrollable list interface

### 3. Create Post Screen
- Form for creating new skill offerings
- Fields: title, description, category selection
- Logs form data to console when submitted
- Navigation back to home feed after creation

### 4. Profile Screen
- User information display (name, email, bio)
- Skills array with chip-style layout
- User statistics (posts created, students helped, rating)

## Customization

### Adding New Skills Categories
Edit the `categories` array in `app/(tabs)/create.tsx`:

```typescript
const categories = [
  'Programming',
  'Music',
  'Languages',
  // Add new categories here
];
```

### Updating Dummy Data
Modify the data in:
- `app/(tabs)/index.tsx` - Home feed skills
- `app/(tabs)/profile.tsx` - User profile data
- `app/(auth)/login.tsx` - Login credentials

### Styling
All styles are defined using React Native's `StyleSheet.create()` with a consistent design system:
- Primary color: `#007AFF` (iOS blue)
- Secondary color: `#34C759` (green)
- Background: `#f8f9fa` (light gray)
- Cards: White with subtle shadows

## Development Commands

- `npm run dev` - Start development server
- `npm run build:web` - Build for web
- `expo install` - Install Expo-compatible packages
- `expo doctor` - Check for common issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is licensed under the MIT License.