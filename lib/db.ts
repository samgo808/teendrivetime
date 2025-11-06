import Dexie, { Table } from 'dexie';

export interface DriveSession {
  id?: number;
  startTime: Date;
  endTime?: Date;
  startLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  distance?: number; // in miles
  duration?: number; // in minutes
  isNightDrive: boolean;
  verifierInitials?: string;
  comments?: string;
  verified: boolean;
  createdAt: Date;
}

export class DriveTimeDB extends Dexie {
  driveSessions!: Table<DriveSession>;

  constructor() {
    super('DriveTimeDB');
    this.version(1).stores({
      driveSessions: '++id, startTime, endTime, verified, isNightDrive'
    });
  }
}

// Only initialize database on client side
let dbInstance: DriveTimeDB | null = null;

export const getDb = (): DriveTimeDB => {
  if (typeof window === 'undefined') {
    // Return a mock during SSR
    return null as any;
  }

  if (!dbInstance) {
    dbInstance = new DriveTimeDB();
  }

  return dbInstance;
};

// For backwards compatibility
export const db = typeof window !== 'undefined' ? new DriveTimeDB() : null as any;
