'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Trophy, Target, Moon, Clock, Award } from 'lucide-react';

export default function ProgressDashboard() {
  const sessions = useLiveQuery(() => db.driveSessions.toArray()) || [];

  const totalHours = sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / 60;
  const nightHours = sessions
    .filter((s: any) => s.isNightDrive)
    .reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / 60;
  const dayHours = totalHours - nightHours;
  const verifiedCount = sessions.filter((s: any) => s.verified).length;

  const totalProgress = Math.min((totalHours / 50) * 100, 100);
  const nightProgress = Math.min((nightHours / 10) * 100, 100);

  const getBadges = () => {
    const badges = [];
    if (totalHours >= 10) badges.push({ name: 'First 10 Hours', icon: '🎯', color: 'bg-blue-100 text-blue-800' });
    if (totalHours >= 25) badges.push({ name: 'Halfway There', icon: '🏆', color: 'bg-purple-100 text-purple-800' });
    if (totalHours >= 50) badges.push({ name: 'Goal Achieved!', icon: '🎉', color: 'bg-green-100 text-green-800' });
    if (nightHours >= 5) badges.push({ name: 'Night Owl', icon: '🦉', color: 'bg-indigo-100 text-indigo-800' });
    if (nightHours >= 10) badges.push({ name: 'Night Master', icon: '🌙', color: 'bg-gray-100 text-gray-800' });
    if (sessions.length >= 20) badges.push({ name: '20 Drives', icon: '🚗', color: 'bg-yellow-100 text-yellow-800' });
    return badges;
  };

  const badges = getBadges();

  return (
    <div className="space-y-6">
      {/* Main Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Progress
          </h2>
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>

        <div className="space-y-6">
          {/* Total Hours */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Hours
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {totalHours.toFixed(1)} / 50 hrs
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>

          {/* Night Hours */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Night Hours
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {nightHours.toFixed(1)} / 10 hrs
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${nightProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessions.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Drives</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Award className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {verifiedCount}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Verified</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Target className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.max(0, 50 - totalHours).toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Hrs Left</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`${badge.color} px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2`}
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
