'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DriveSession } from '@/lib/db';
import { format } from 'date-fns';
import { MapPin, Clock, Moon, Sun, CheckCircle, Circle, Trash2 } from 'lucide-react';
import VerificationModal from './VerificationModal';

export default function DriveHistory() {
  const sessions = useLiveQuery(() =>
    db.driveSessions.orderBy('startTime').reverse().toArray()
  ) || [];

  const [selectedSession, setSelectedSession] = useState<DriveSession | null>(null);
  const [, setRefreshKey] = useState(0);

  // Listen for new sessions
  useEffect(() => {
    const handleNewSession = () => setRefreshKey(k => k + 1);
    window.addEventListener('driveSessionAdded', handleNewSession);
    return () => window.removeEventListener('driveSessionAdded', handleNewSession);
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this drive session?')) {
      await db.driveSessions.delete(id);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Drive History
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No drive sessions yet. Start your first drive to see it here!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Drive History
        </h2>

        <div className="space-y-3">
          {sessions.map((session: DriveSession) => (
            <div
              key={session.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {session.isNightDrive ? (
                    <Moon className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {format(new Date(session.startTime), 'MMM d, yyyy')}
                  </span>
                  {session.verified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => handleDelete(session.id!)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{session.duration} min</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{session.distance?.toFixed(2)} mi</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-500 mb-2 space-y-1">
                <div className="truncate">
                  <strong>From:</strong> {session.startLocation.address ||
                    `${session.startLocation.latitude.toFixed(4)}, ${session.startLocation.longitude.toFixed(4)}`}
                </div>
                {session.endLocation && (
                  <div className="truncate">
                    <strong>To:</strong> {session.endLocation.address ||
                      `${session.endLocation.latitude.toFixed(4)}, ${session.endLocation.longitude.toFixed(4)}`}
                  </div>
                )}
              </div>

              {session.verified && session.verifierInitials && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                  <p className="text-green-800 dark:text-green-300">
                    <strong>Verified by:</strong> {session.verifierInitials}
                  </p>
                  {session.comments && (
                    <p className="text-green-700 dark:text-green-400 mt-1">
                      <strong>Comments:</strong> {session.comments}
                    </p>
                  )}
                </div>
              )}

              {!session.verified && (
                <button
                  onClick={() => setSelectedSession(session)}
                  className="mt-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                >
                  Add Verification
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedSession && (
        <VerificationModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onVerified={() => setRefreshKey(k => k + 1)}
        />
      )}
    </>
  );
}
