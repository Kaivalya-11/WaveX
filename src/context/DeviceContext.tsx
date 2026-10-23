"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface ConnectedDevice {
  label: string;
  shortName: string;
  type: 'earbuds' | 'headphones' | 'speaker' | 'bluetooth';
  deviceId?: string;
  isActive?: boolean;
}

export interface StorageInfo {
  diskName: string;
  fsType: string;
  totalGB: number;
  usedGB: number;
  freeGB: number;
}

const DEFAULT_STORAGE: StorageInfo = {
  diskName: 'Local Disk (C:)',
  fsType: 'NTFS Encrypted',
  totalGB: 475.6,
  usedGB: 207.0,
  freeGB: 268.6,
};

interface DeviceContextType {
  device: ConnectedDevice;
  allDevices: ConnectedDevice[];
  storage: StorageInfo;
  selectDevice: (d: ConnectedDevice) => void;
  promptDevicePicker: () => Promise<void>;
}

const DEFAULT_DEVICE: ConnectedDevice = {
  label: 'AirBass Earbuds',
  shortName: 'AirBass Earbuds',
  type: 'earbuds',
  isActive: true,
};

const DeviceContext = createContext<DeviceContextType>({
  device: DEFAULT_DEVICE,
  allDevices: [DEFAULT_DEVICE],
  storage: DEFAULT_STORAGE,
  selectDevice: () => {},
  promptDevicePicker: async () => {},
});

function parseDevice(label: string, deviceId?: string): ConnectedDevice {
  const lower = (label || '').toLowerCase();
  let type: ConnectedDevice['type'] = 'speaker';
  if (lower.includes('earbud') || lower.includes('airdopes') || lower.includes('airbass') || lower.includes('buds') || lower.includes('airpod')) {
    type = 'earbuds';
  } else if (lower.includes('headphone') || lower.includes('headset')) {
    type = 'headphones';
  } else if (lower.includes('bluetooth') || lower.includes('wireless')) {
    type = 'bluetooth';
  }

  // Clean label
  let clean = label
    .replace(/^Default - /i, '')
    .replace(/^Communications - /i, '')
    .replace(/\(Hands-Free.*?\)/i, '')
    .trim();

  if (!clean || clean === 'Default') {
    clean = 'AirBass Earbuds';
  }

  let short = clean;
  if (clean.includes('AirBass')) short = 'AirBass Earbuds';
  else if (clean.includes('Airdopes')) short = 'Airdopes';
  else if (clean.includes('Realtek')) short = 'Speakers';
  else if (short.length > 18) short = short.slice(0, 16) + '...';

  return { label: clean, shortName: short, type, deviceId };
}

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<ConnectedDevice>(DEFAULT_DEVICE);
  const [allDevices, setAllDevices] = useState<ConnectedDevice[]>([DEFAULT_DEVICE]);
  const [storage, setStorage] = useState<StorageInfo>(DEFAULT_STORAGE);

  const refreshDevices = useCallback(async () => {
    try {
      // 1. Fetch system detected active devices from backend
      const res = await fetch('/api/device');
      if (res.ok) {
        const data = await res.json();
        if (data.storage) {
          setStorage(data.storage);
        }
        if (data.deviceName) {
          const sysDevice: ConnectedDevice = {
            label: data.deviceName,
            shortName: data.shortName || data.deviceName,
            type: data.type || 'earbuds',
            isActive: true,
          };
          setDevice(sysDevice);

          if (Array.isArray(data.devices) && data.devices.length > 0) {
            setAllDevices(data.devices.map((d: any) => ({
              label: d.label,
              shortName: d.shortName || d.label,
              type: d.type || 'speaker',
              isActive: d.label === sysDevice.label,
            })));
          }
        }
      }

      // 2. Query browser MediaDevices API if available
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devList.filter(d => d.kind === 'audiooutput' && d.label);

        if (audioOutputs.length > 0) {
          const parsedList = audioOutputs.map(d => parseDevice(d.label, d.deviceId));
          
          // Select preferred device (earbuds/headphones first, else default)
          const preferred = parsedList.find(d => d.type === 'earbuds' || d.type === 'headphones') || parsedList[0];
          if (preferred) {
            setDevice(preferred);
          }
          setAllDevices(parsedList);
        }
      }
    } catch {
      // Keep existing default
    }
  }, []);

  useEffect(() => {
    refreshDevices();

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.addEventListener) {
      const handler = () => refreshDevices();
      navigator.mediaDevices.addEventListener('devicechange', handler);
      return () => navigator.mediaDevices.removeEventListener('devicechange', handler);
    }
  }, [refreshDevices]);

  const selectDevice = (newDevice: ConnectedDevice) => {
    setDevice(newDevice);
    setAllDevices(prev => prev.map(d => ({ ...d, isActive: d.label === newDevice.label })));
  };

  const promptDevicePicker = async () => {
    if (typeof navigator !== 'undefined' && (navigator.mediaDevices as any)?.selectAudioOutput) {
      try {
        const selected = await (navigator.mediaDevices as any).selectAudioOutput();
        if (selected?.label) {
          const parsed = parseDevice(selected.label, selected.deviceId);
          selectDevice(parsed);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('selectAudioOutput error:', err);
        }
      }
    } else {
      await refreshDevices();
    }
  };

  return (
    <DeviceContext.Provider value={{ device, allDevices, storage, selectDevice, promptDevicePicker }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useConnectedDevice() {
  return useContext(DeviceContext);
}

