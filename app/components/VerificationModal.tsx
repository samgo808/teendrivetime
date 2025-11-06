'use client';

import { useState } from 'react';
import { db, DriveSession } from '@/lib/db';
import { X, CheckCircle } from 'lucide-react';

interface VerificationModalProps {
  session: DriveSession;
  onClose: () => void;
  onVerified: () => void;
}

export default function VerificationModal({ session, onClose, onVerified }: VerificationModalProps) {
  const [initials, setInitials] = useState(session.verifierInitials || '');
  const [comments, setComments] = useState(session.comments || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await db.driveSessions.update(session.id!, {
        verifierInitials: initials,
        comments: comments,
        verified: true,
      });

      onVerified();
      onClose();
    } catch (error) {
      console.error('Failed to verify session:', error);
      alert('Failed to save verification. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Verify Drive Session
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
          <p className="text-gray-600 dark:text-gray-300">
            <strong>Duration:</strong> {session.duration} minutes
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <strong>Distance:</strong> {session.distance?.toFixed(2)} miles
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <strong>Type:</strong> {session.isNightDrive ? 'Night Drive' : 'Day Drive'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="initials"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Verifier&apos;s Initials <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              maxLength={5}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white uppercase"
              placeholder="ABC"
            />
          </div>

          <div>
            <label
              htmlFor="comments"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Comments (Optional)
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Add any notes about this drive session..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !initials.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
