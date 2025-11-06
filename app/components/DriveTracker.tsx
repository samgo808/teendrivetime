'use client';

import { useState, useEffect } from 'react';
import { useDriveStore } from '@/lib/store';
import { getCurrentLocation, calculateDistance, isNightTime } from '@/lib/location';
import { db, DriveSession } from '@/lib/db';
import { Play, Square, MapPin, Clock, Moon, Sun } from 'lucide-react';

export default function DriveTracker() {
  const { activeDrive, startDrive, endDrive } = useDriveStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for active drive
  useEffect(() => {
    if (!activeDrive) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeDrive.startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeDrive]);

  const handleStartDrive = async () => {
    console.log('Start Drive button clicked');
    setIsLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      const isNight = isNightTime();
      startDrive(location, isNight);
    } catch (err) {
      setError('Unable to get your location. Please enable location services.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndDrive = async () => {
    console.log('End Drive button clicked');
    if (!activeDrive) return;

    setIsLoading(true);
    setError(null);

    try {
      const endLocation = await getCurrentLocation();
      const endTime = new Date();

      const duration = Math.floor((endTime.getTime() - activeDrive.startTime.getTime()) / 60000); // minutes
      const distance = calculateDistance(
        activeDrive.startLocation.latitude,
        activeDrive.startLocation.longitude,
        endLocation.latitude,
        endLocation.longitude
      );

      const session: DriveSession = {
        startTime: activeDrive.startTime,
        endTime,
        startLocation: activeDrive.startLocation,
        endLocation,
        distance,
        duration,
        isNightDrive: activeDrive.isNightDrive,
        verified: false,
        createdAt: new Date(),
      };

      await db.driveSessions.add(session);
      endDrive();

      // Trigger a custom event to notify other components
      window.dispatchEvent(new Event('driveSessionAdded'));
    } catch (err) {
      setError('Unable to save drive session. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Drive Tracker
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!activeDrive ? (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ready to start tracking your drive?
          </p>
          <button
            onClick={handleStartDrive}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-full transition-colors text-lg shadow-lg"
          >
            <Play className="w-6 h-6" />
            {isLoading ? 'Getting Location...' : 'Start Drive'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Drive in Progress
              </h3>
              <div className="flex items-center gap-1 text-sm">
                {activeDrive.isNightDrive ? (
                  <>
                    <Moon className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-600 dark:text-blue-400">Night Drive</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-600 dark:text-yellow-400">Day Drive</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="break-all">
                  {activeDrive.startLocation.address ||
                    `${activeDrive.startLocation.latitude.toFixed(4)}, ${activeDrive.startLocation.longitude.toFixed(4)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Started: {activeDrive.startTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-4 font-mono">
              {formatTime(elapsedTime)}
            </div>
            <button
              onClick={handleEndDrive}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-full transition-colors text-lg shadow-lg"
            >
              <Square className="w-6 h-6" />
              {isLoading ? 'Saving...' : 'End Drive'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
