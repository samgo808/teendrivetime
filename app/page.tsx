'use client';

import DriveTracker from './components/DriveTracker';
import ProgressDashboard from './components/ProgressDashboard';
import DriveHistory from './components/DriveHistory';
import ExportButton from './components/ExportButton';
import RegisterServiceWorker from './register-sw';
import { Car } from 'lucide-react';

export default function Home() {
  return (
    <>
      <RegisterServiceWorker />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Car className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              TeenDriveTime
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track your journey to getting your driver&apos;s license
          </p>
        </div>

        {/* Main Grid */}
        <div className="space-y-6">
          {/* Drive Tracker */}
          <DriveTracker />

          {/* Progress Dashboard */}
          <ProgressDashboard />

          {/* Export */}
          <ExportButton />

          {/* Drive History */}
          <DriveHistory />
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pb-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Stay safe on the road! 🚗</p>
          <p className="mt-1">TeenDriveTime v1.0</p>
        </footer>
      </div>
    </main>
    </>
  );
}
