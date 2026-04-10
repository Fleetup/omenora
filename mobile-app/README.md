# OMENORA Mobile App

A React Native mobile application for OMENORA - AI-powered astrology and destiny analysis.

## 🚀 Tech Stack

- **Framework**: React Native with Expo SDK 51
- **Language**: TypeScript 5.3
- **Node Version**: 22.x (LTS)
- **Navigation**: React Navigation v6
- **State Management**: Zustand with persistence
- **Styling**: React Native StyleSheet + Expo Linear Gradient
- **HTTP Client**: Axios
- **Payments**: Stripe React Native
- **Authentication**: Apple Authentication (iOS)

## 📁 Project Structure

```
mobile-app/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios configuration
│   │   └── endpoints.ts  # API endpoint definitions
│   ├── assets/           # Images, fonts, icons
│   ├── components/       # Reusable UI components
│   ├── constants/        # App constants and config
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── AnalysisScreen.tsx
│   │   ├── PreviewScreen.tsx
│   │   ├── ReportScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── CompatibilityScreen.tsx
│   │   ├── SubscriptionScreen.tsx
│   │   ├── PrivacyScreen.tsx
│   │   └── TermsScreen.tsx
│   ├── stores/           # Zustand state stores
│   │   └── analysisStore.ts
│   ├── theme/            # Design system
│   │   ├── colors.ts
│   │   └── ThemeProvider.tsx
│   └── utils/            # Utility functions
├── App.tsx               # App entry point
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
├── package.json
└── tsconfig.json
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 22.x (use nvm to manage)
- npm or yarn
- Expo CLI: `npm install -g eas-cli expo-cli`
- iOS: macOS with Xcode 15+
- Android: Android Studio with SDK

### Installation

1. **Navigate to mobile app directory**:
```bash
cd mobile-app
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
Create a `.env` file in the root:
```env
API_BASE_URL=https://api.omenora.com
# For local development:
# API_BASE_URL=http://YOUR_LOCAL_IP:3000
```

4. **Update app configuration**:
Edit `app.json` to add your:
- EAS Project ID
- Apple Team ID
- Google Play credentials
- Sentry DSN (optional)

## 🏃 Running the App

### Development Mode

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Testing on Real Device (iOS - Apple Developer Mode)

1. **Enable Developer Mode on iPhone**:
   - Settings → Privacy & Security → Developer Mode → ON
   - Restart device when prompted

2. **Register your device**:
   - Connect iPhone to Mac via USB
   - In Xcode: Window → Devices and Simulators
   - Device will be registered automatically

3. **Build development client**:
```bash
eas build --profile development --platform ios
```

4. **Install on device**:
   - Download the build from EAS
   - Install via Apple Configurator 2 or TestFlight

5. **Trust the developer**:
   - Settings → General → VPN & Device Management
   - Trust your Apple ID

### Testing on Real Device (Android)

1. **Enable Developer Options**:
   - Settings → About Phone → Tap Build Number 7 times

2. **Enable USB Debugging**:
   - Settings → System → Developer Options → USB Debugging

3. **Connect and run**:
```bash
npm run android
```

## 📱 App Store Preparation

### iOS App Store

1. **Create App Store Connect record**:
   - App Store Connect → My Apps → + New App
   - Bundle ID: `com.omenora.app`
   - SKU: `omenora-001`

2. **Configure App Information**:
   - Name: OMENORA
   - Subtitle: AI Astrology & Destiny
   - Primary Category: Lifestyle
   - Secondary Category: Entertainment

3. **Upload screenshots**:
   - iPhone 6.5" Display (1242 x 2688)
   - iPhone 5.5" Display (1242 x 2208)
   - iPad Pro 12.9" Display (2048 x 2732)

4. **Build and submit**:
```bash
eas build --profile production --platform ios
eas submit --platform ios
```

### Google Play Store

1. **Create Google Play Console record**:
   - Package name: `com.omenora.app`

2. **Configure store listing**:
   - Title: OMENORA
   - Short description: AI-powered astrology readings
   - Full description: [See marketing copy]

3. **Upload assets**:
   - App icon (512 x 512 PNG)
   - Feature graphic (1024 x 500 PNG)
   - Screenshots (various sizes)

4. **Build and submit**:
```bash
eas build --profile production --platform android
eas submit --platform android
```

## 🔧 Development Guidelines

### Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with universe config
- **Formatting**: Prettier (optional)

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add route type in `src/navigation/types.ts`
3. Register in `src/navigation/RootNavigator.tsx`
4. Add navigation link from appropriate screen

### API Integration

```typescript
import { api } from '../api/endpoints';

// In your component/hook
const generateReport = async () => {
  try {
    const response = await api.generateReport({
      firstName: 'John',
      dateOfBirth: '1990-01-01',
      city: 'New York',
      answers: { q1: 'action', q2: 'growth' }
    });
    return response;
  } catch (error) {
    console.error('Failed to generate report:', error);
    throw error;
  }
};
```

### State Management

```typescript
import { useAnalysisStore } from '../stores/analysisStore';

// In your component
const { firstName, setFirstName } = useAnalysisStore();

// Persisted automatically
setFirstName('John');
```

## 🎨 Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `primary.main` | `#7B61FF` | Buttons, accents |
| `background.main` | `#050410` | App background |
| `text.primary` | `#ffffff` | Headings |
| `text.secondary` | `rgba(255,255,255,0.85)` | Body text |

### Typography

- Headings: System font, 28-42px, Light weight
- Body: System font, 14-16px, Regular weight
- Labels: System font, 12px, Uppercase, Letter spacing 1

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 🚀 Deployment

### Staging/Preview

```bash
# iOS - internal testing
eas build --profile preview --platform ios

# Android - internal testing  
eas build --profile preview --platform android
```

### Production

```bash
# Build production apps
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 📋 App Store Compliance Checklist

### Content Guidelines

- [ ] No objectionable content
- [ ] Accurate app description
- [ ] Proper age rating (17+ for astrology)
- [ ] Privacy policy URL included
- [ ] Terms of service accessible

### Technical Requirements

- [ ] iOS 13.0+ support
- [ ] Android 8.0+ support  
- [ ] iPad compatibility (iOS)
- [ ] Dark mode support
- [ ] Push notification permissions
- [ ] In-app purchases configured (Stripe)

### Legal

- [ ] Privacy policy hosted at https://omenora.com/privacy
- [ ] Terms of service at https://omenora.com/terms
- [ ] GDPR compliance (data export/deletion)
- [ ] CCPA compliance (California users)

## 🔗 Integration with Web Backend

The mobile app uses the same backend API as the web application:

| Feature | Web Endpoint | Mobile Usage |
|---------|--------------|--------------|
| Generate Report | POST /api/generate-report | `api.generateReport()` |
| Birth Chart | POST /api/generate-birth-chart | `api.generateBirthChart()` |
| Compatibility | POST /api/generate-compatibility | `api.generateCompatibility()` |
| Calendar | POST /api/generate-calendar | `api.generateCalendar()` |
| Payments | POST /api/create-payment | Stripe React Native |

## 🆘 Troubleshooting

### iOS Build Issues

**"Could not find Developer Disk Image"**:
- Update Xcode to latest version
- Ensure device iOS version matches Xcode support

**"No profiles found"**:
- Check Apple Developer Portal for valid provisioning profiles
- Run `eas credentials` to sync

### Android Build Issues

**"Gradle sync failed"**:
- Clean build: `cd android && ./gradlew clean`
- Update Android Studio and SDK

**"Duplicate class" errors**:
- Run `./gradlew app:dependencies` to find conflicts
- Exclude conflicting modules in `app/build.gradle`

### Metro Bundler Issues

**"Unable to resolve module"**:
- Clear cache: `npx expo start --clear`
- Reset metro: `watchman watch-del-all && rm -rf node_modules && npm install`

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## 👥 Support

For technical support or questions:
- Email: support@omenora.com
- GitHub Issues: [Repository URL]

---

**OMENORA** - AI decoded your destiny. Science explains why.
