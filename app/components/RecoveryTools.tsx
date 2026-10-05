'use client';

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { ArchiveRestore, DatabaseBackup, PlusCircle } from 'lucide-react';
import { db, DriveSession } from '@/lib/db';

type EntrySource = 'pdf' | 'estimated';
type DriveType = 'day' | 'night';

interface BackupFile {
  format: 'teendrivetime-backup';
  version: 1;
  exportedAt: string;
  sessions: unknown[];
}

const emptyForm = {
  date: format(new Date(), 'yyyy-MM-dd'),
  startTime: '',
  endTime: '',
  startLocation: '',
  endLocation: '',
  distance: '',
  driveType: 'day' as DriveType,
  source: 'pdf' as EntrySource,
  comments: '',
};

const parseDate = (value: unknown, field: string): Date => {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${field}.`);
  return date;
};

const normalizeSession = (value: unknown): Omit<DriveSession, 'id'> => {
  if (!value || typeof value !== 'object') throw new Error('A drive record is not an object.');
  const raw = value as Record<string, unknown>;
  const startTime = parseDate(raw.startTime, 'start time');
  const endTime = raw.endTime == null ? undefined : parseDate(raw.endTime, 'end time');
  const createdAt = raw.createdAt == null ? new Date() : parseDate(raw.createdAt, 'created date');
  const duration = Number(raw.duration);

  if (!Number.isFinite(duration) || duration < 0 || duration > 24 * 60) {
    throw new Error('Every imported drive must have a duration between 0 minutes and 24 hours.');
  }

  const normalizeLocation = (location: unknown, name: string) => {
    if (!location || typeof location !== 'object') throw new Error(`Missing ${name}.`);
    const source = location as Record<string, unknown>;
    const latitude = Number(source.latitude);
    const longitude = Number(source.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error(`Invalid coordinates in ${name}.`);
    }
    return {
      latitude,
      longitude,
      ...(typeof source.address === 'string' && source.address.trim()
        ? { address: source.address.trim() }
        : {}),
    };
  };

  const allowedSources: DriveSession['entrySource'][] = ['tracked', 'pdf', 'estimated', 'imported'];
  const entrySource = allowedSources.includes(raw.entrySource as DriveSession['entrySource'])
    ? raw.entrySource as DriveSession['entrySource']
    : 'imported';
  const distance = raw.distance == null || raw.distance === '' ? undefined : Number(raw.distance);
  if (distance != null && (!Number.isFinite(distance) || distance < 0)) {
    throw new Error('A drive contains an invalid distance.');
  }

  return {
    startTime,
    ...(endTime ? { endTime } : {}),
    startLocation: normalizeLocation(raw.startLocation, 'start location'),
    ...(raw.endLocation ? { endLocation: normalizeLocation(raw.endLocation, 'end location') } : {}),
    ...(distance == null ? {} : { distance }),
    duration: Math.round(duration),
    isNightDrive: Boolean(raw.isNightDrive),
    ...(typeof raw.verifierInitials === 'string' && raw.verifierInitials.trim()
      ? { verifierInitials: raw.verifierInitials.trim().toUpperCase().slice(0, 5) }
      : {}),
    ...(typeof raw.comments === 'string' && raw.comments.trim()
      ? { comments: raw.comments.trim() }
      : {}),
    verified: Boolean(raw.verified),
    createdAt,
    entrySource,
  };
};

const sessionKey = (session: Omit<DriveSession, 'id'> | DriveSession) => [
  new Date(session.startTime).toISOString(),
  session.endTime ? new Date(session.endTime).toISOString() : '',
  session.duration ?? '',
  session.startLocation.address ?? `${session.startLocation.latitude},${session.startLocation.longitude}`,
  session.endLocation?.address ?? (session.endLocation ? `${session.endLocation.latitude},${session.endLocation.longitude}` : ''),
].join('|').toLowerCase();

export default function RecoveryTools() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedDriveType = useMemo<DriveType>(() => {
    const hour = Number(form.startTime.split(':')[0]);
    return Number.isFinite(hour) && (hour >= 18 || hour < 6) ? 'night' : 'day';
  }, [form.startTime]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
    setMessage(null);
  };

  const applySuggestedType = () => updateField('driveType', suggestedDriveType);

  const addPastDrive = async (event: FormEvent) => {
    event.preventDefault();
    setIsWorking(true);
    setMessage(null);

    try {
      const startTime = new Date(`${form.date}T${form.startTime}:00`);
      const endTime = new Date(`${form.date}T${form.endTime}:00`);
      if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      const distance = form.distance.trim() === '' ? undefined : Number(form.distance);

      if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
        throw new Error('Enter a valid date, start time, and end time.');
      }
      if (startTime > new Date()) throw new Error('A past drive cannot start in the future.');
      if (duration <= 0 || duration > 24 * 60) throw new Error('Drive duration must be between 1 minute and 24 hours.');
      if (distance != null && (!Number.isFinite(distance) || distance < 0)) throw new Error('Distance must be zero or greater.');

      const session: Omit<DriveSession, 'id'> = {
        startTime,
        endTime,
        startLocation: { latitude: 0, longitude: 0, address: form.startLocation.trim() || 'Not recorded' },
        endLocation: { latitude: 0, longitude: 0, address: form.endLocation.trim() || 'Not recorded' },
        ...(distance == null ? {} : { distance }),
        duration,
        isNightDrive: form.driveType === 'night',
        verified: false,
        createdAt: new Date(),
        entrySource: form.source,
        ...(form.comments.trim() ? { comments: form.comments.trim() } : {}),
      };

      const existing = await db.driveSessions.toArray();
      if (existing.some((item: DriveSession) => sessionKey(item) === sessionKey(session))) {
        throw new Error('That drive already appears to be in the log.');
      }

      await db.driveSessions.add(session);
      window.dispatchEvent(new Event('driveSessionAdded'));
      setForm({ ...emptyForm, date: form.date });
      setMessage({ type: 'success', text: `Added a ${duration}-minute ${form.source === 'pdf' ? 'PDF-backed' : 'estimated'} drive.` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to add the drive.' });
    } finally {
      setIsWorking(false);
    }
  };

  const downloadBackup = async () => {
    setIsWorking(true);
    setMessage(null);
    try {
      const sessions = await db.driveSessions.orderBy('startTime').toArray();
      const backup: BackupFile = {
        format: 'teendrivetime-backup',
        version: 1,
        exportedAt: new Date().toISOString(),
        sessions,
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teendrivetime-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: `Downloaded a restorable backup containing ${sessions.length} drives.` });
    } catch {
      setMessage({ type: 'error', text: 'Unable to create the backup.' });
    } finally {
      setIsWorking(false);
    }
  };

  const restoreBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsWorking(true);
    setMessage(null);

    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Backup file is larger than 5 MB.');
      const parsed = JSON.parse(await file.text()) as BackupFile | unknown[];
      const rawSessions = Array.isArray(parsed) ? parsed : parsed?.sessions;
      if (!Array.isArray(rawSessions)) throw new Error('This is not a TeenDriveTime backup.');
      if (rawSessions.length > 10000) throw new Error('Backup contains too many records.');

      const normalized = rawSessions.map(normalizeSession);
      const existingKeys = new Set((await db.driveSessions.toArray()).map((session: DriveSession) => sessionKey(session)));
      const newKeys = new Set<string>();
      const additions = normalized.filter(session => {
        const key = sessionKey(session);
        if (existingKeys.has(key) || newKeys.has(key)) return false;
        newKeys.add(key);
        return true;
      });

      if (additions.length) await db.driveSessions.bulkAdd(additions);
      window.dispatchEvent(new Event('driveSessionAdded'));
      const skipped = normalized.length - additions.length;
      setMessage({
        type: 'success',
        text: `Restored ${additions.length} drives${skipped ? ` and skipped ${skipped} exact duplicates` : ''}. Existing records were not changed.`,
      });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to restore the backup.' });
    } finally {
      event.target.value = '';
      setIsWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add a Past Drive</h2>
          <PlusCircle className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          Add a drive from a PDF record or a clearly labeled reconstruction. New entries remain unverified until a supervisor verifies them.
        </p>

        <form onSubmit={addPastDrive} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
              <input required type="date" value={form.date} onChange={event => updateField('date', event.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Start time
              <input required type="time" value={form.startTime} onChange={event => updateField('startTime', event.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              End time
              <input required type="time" value={form.endTime} onChange={event => updateField('endTime', event.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From
              <input type="text" value={form.startLocation} onChange={event => updateField('startLocation', event.target.value)} placeholder="Home, school, or address" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To
              <input type="text" value={form.endLocation} onChange={event => updateField('endLocation', event.target.value)} placeholder="Destination or address" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </label>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Distance (miles, optional)
              <input type="number" min="0" step="0.01" value={form.distance} onChange={event => updateField('distance', event.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drive type
              <select value={form.driveType} onChange={event => updateField('driveType', event.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                <option value="day">Day</option>
                <option value="night">Night</option>
              </select>
              {form.startTime && form.driveType !== suggestedDriveType && (
                <button type="button" onClick={applySuggestedType} className="mt-1 text-xs text-blue-600 hover:underline">
                  Use {suggestedDriveType} based on start time
                </button>
              )}
            </label>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Record source
              <select value={form.source} onChange={event => updateField('source', event.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                <option value="pdf">PDF-backed</option>
                <option value="estimated">Reconstructed estimate</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reconstruction notes (optional)
            <textarea rows={2} value={form.comments} onChange={event => updateField('comments', event.target.value)} placeholder="What this entry is based on" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white resize-none" />
          </label>

          <button disabled={isWorking} type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md">
            <PlusCircle className="w-5 h-5" /> Add Past Drive
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Backup & Restore</h2>
          <DatabaseBackup className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          JSON backups can be restored into TeenDriveTime. Restoring only adds missing drives; it never replaces existing records.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button disabled={isWorking} onClick={downloadBackup} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white rounded-md">
            <DatabaseBackup className="w-5 h-5" /> Download JSON Backup
          </button>
          <button disabled={isWorking} onClick={() => fileInputRef.current?.click()} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white rounded-md">
            <ArchiveRestore className="w-5 h-5" /> Restore JSON Backup
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={restoreBackup} className="hidden" />
        </div>
      </div>

      {message && (
        <div role="status" className={`rounded-md border p-4 text-sm ${
          message.type === 'success'
            ? 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
