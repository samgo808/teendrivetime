import { create } from 'zustand';
import { DriveSession } from './db';

interface ActiveDrive {
  startTime: Date;
  startLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  isNightDrive: boolean;
}

interface DriveStore {
  activeDrive: ActiveDrive | null;
  startDrive: (startLocation: any, isNight: boolean) => void;
  endDrive: () => ActiveDrive | null;
  clearActiveDrive: () => void;
}

export const useDriveStore = create<DriveStore>((set, get) => ({
  activeDrive: null,

  startDrive: (startLocation, isNight) => {
    set({
      activeDrive: {
        startTime: new Date(),
        startLocation,
        isNightDrive: isNight,
      },
    });
  },

  endDrive: () => {
    const active = get().activeDrive;
    set({ activeDrive: null });
    return active;
  },

  clearActiveDrive: () => {
    set({ activeDrive: null });
  },
}));
