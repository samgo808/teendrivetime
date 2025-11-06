# TeenDriveTime 🚗

A Progressive Web App (PWA) to track driving hours for learner's permit requirements. Built with Next.js, TypeScript, and Tailwind CSS.

## Features ✨

- **GPS Tracking**: Automatically captures start and end locations using device GPS
- **Drive Sessions**: Track time, distance, and locations for each drive
- **Night/Day Detection**: Automatically identifies night driving (6 PM - 6 AM)
- **Progress Dashboard**: Visual progress bars showing completion towards 50 total hours and 10 night hours
- **Gamification**: Earn badges and achievements as you progress
- **Verification System**: Adult supervisors can sign off on drives with initials and comments
- **Export Functionality**: Download complete driving log as PDF or TXT file
- **Installable PWA**: Add to iPhone home screen for native app-like experience
- **Offline Support**: Works without internet connection (service worker)
- **Local Storage**: All data stored locally on device using IndexedDB

## Tech Stack 🛠️

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Dexie.js (IndexedDB wrapper)
- **State Management**: Zustand
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Date Handling**: date-fns
- **GPS**: Web Geolocation API
- **Geocoding**: OpenStreetMap Nominatim API

## Getting Started 🚀

### Prerequisites

- Node.js 18+ installed
- GitHub account (for deployment)
- Vercel account (for hosting)

### Installation

1. **Clone or navigate to the repository**:
   ```bash
   cd teendrivetime
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel 🌐

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy: `Y`
   - Which scope: (select your account)
   - Link to existing project: `N`
   - Project name: `teendrivetime` (or your choice)
   - Directory: `./`
   - Override settings: `N`

5. **Production deployment**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub + Vercel Dashboard

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: TeenDriveTime app"
   ```

2. **Create GitHub repository**:
   - Go to [GitHub](https://github.com/new)
   - Create new repository named `teendrivetime`
   - Don't initialize with README (already exists)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/teendrivetime.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Click "Deploy"

5. **Access your app**:
   - Vercel will provide a URL like `teendrivetime.vercel.app`
   - You can add a custom domain in project settings

## Using on iPhone 📱

### Install as PWA

1. Open the deployed URL in Safari on iPhone
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Name it "TeenDriveTime" and tap "Add"
5. The app will appear on your home screen like a native app

### Grant Location Permissions

1. When you first start a drive, Safari will ask for location permission
2. Tap "Allow" to enable GPS tracking
3. For best results, select "Allow While Using App"

## Usage Guide 📖

### Starting a Drive

1. Open the app
2. Tap "Start Drive" button
3. Grant location permission if prompted
4. The app will capture your starting location
5. A timer will begin showing elapsed time

### Ending a Drive

1. When you arrive at your destination, tap "End Drive"
2. The app will capture your ending location
3. Distance and duration are automatically calculated
4. The drive is saved to your history

### Verifying a Drive

1. Go to Drive History section
2. Find the drive session you want to verify
3. Tap "Add Verification"
4. Enter verifier's initials (required)
5. Add optional comments
6. Tap "Verify"

### Exporting Data

1. Scroll to "Export Data" section
2. Choose format:
   - **TXT**: Plain text file with all drive details
   - **PDF**: Formatted PDF document ready to print/submit
3. File will download to your device
4. Share or print as needed

### Tracking Progress

- **Total Hours**: Shows progress towards 50-hour requirement
- **Night Hours**: Shows progress towards 10-hour night driving requirement
- **Achievements**: Earn badges for milestones (10 hrs, 25 hrs, 50 hrs, etc.)
- **Stats**: View total drives, verified drives, and hours remaining

## Project Structure 📁

```
teendrivetime/
├── app/
│   ├── components/
│   │   ├── DriveTracker.tsx       # Start/stop drive functionality
│   │   ├── ProgressDashboard.tsx  # Progress bars and stats
│   │   ├── DriveHistory.tsx       # List of past drives
│   │   ├── VerificationModal.tsx  # Verification form
│   │   └── ExportButton.tsx       # PDF/TXT export
│   ├── layout.tsx                  # Root layout with metadata
│   ├── page.tsx                    # Main page
│   ├── globals.css                 # Global styles
│   └── register-sw.tsx             # Service worker registration
├── lib/
│   ├── db.ts                       # Dexie database setup
│   ├── location.ts                 # GPS and geolocation utilities
│   └── store.ts                    # Zustand state management
├── public/
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service worker
│   ├── icon-192.png                # App icon (192x192)
│   └── icon-512.png                # App icon (512x512)
└── package.json
```

## Customization 🎨

### Change Total Hour Requirements

Edit `app/components/ProgressDashboard.tsx`:

```typescript
const totalProgress = Math.min((totalHours / 50) * 100, 100); // Change 50
const nightProgress = Math.min((nightHours / 10) * 100, 100);  // Change 10
```

### Change Night Hours Definition

Edit `lib/location.ts`:

```typescript
export const isNightTime = (date: Date = new Date()): boolean => {
  const hour = date.getHours();
  return hour >= 18 || hour < 6; // Change 18 (6 PM) and 6 (6 AM)
};
```

### Update App Colors

Edit `tailwind.config.ts` to change the primary color scheme.

### Add More Badges

Edit `app/components/ProgressDashboard.tsx` in the `getBadges()` function.

## Troubleshooting 🔧

### GPS Not Working

- Ensure location services are enabled in iPhone Settings
- Check Safari has location permission
- Must use HTTPS (Vercel provides this automatically)
- GPS requires clear view of sky for accuracy

### App Not Installing on iPhone

- Must be accessed via Safari (not Chrome or Firefox on iOS)
- Must be deployed with HTTPS (http:// won't work)
- Check manifest.json is accessible at `/manifest.json`

### Data Not Saving

- Check browser console for errors
- IndexedDB must be supported (all modern browsers support it)
- Ensure sufficient storage space on device
- Try clearing browser cache and reloading

### Export Not Working

- Check browser allows downloads
- Disable popup blockers
- Try different format (PDF vs TXT)

## Development 💻

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build locally
- `npm run lint` - Run ESLint

### Adding Features

Some ideas for enhancements:

- Add map view showing drive routes
- Implement cloud backup/sync
- Add multiple driver support
- Create detailed analytics and insights
- Add photo uploads for each drive
- Implement parent/teen user roles
- Add practice skill tracking (parking, highway, etc.)

## Browser Support 🌐

- **iOS Safari**: 12+
- **Chrome**: 60+
- **Firefox**: 60+
- **Edge**: 79+

**Note**: GPS tracking requires HTTPS and may not work on some browsers/devices.

## Privacy & Data 🔒

- **All data stored locally** on the device using IndexedDB
- **No server-side storage** or external database
- **No user accounts** or authentication required
- **Location data** never leaves the device
- **No analytics** or tracking
- **Open source** - all code is visible and auditable

## License 📄

MIT License - feel free to modify and use for your own needs.

## Support 💬

For issues or questions:

1. Check the Troubleshooting section above
2. Review the code - it's well-commented
3. Open an issue on GitHub

## Credits 🙏

Built with love for teen drivers learning the road!

- Icons from [Lucide](https://lucide.dev)
- Geocoding by [OpenStreetMap Nominatim](https://nominatim.org)
- Maps data © OpenStreetMap contributors

---

**Drive safe! 🚗💨**
