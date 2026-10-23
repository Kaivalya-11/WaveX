import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import util from 'util';

const execPromise = util.promisify(exec);

export const dynamic = 'force-dynamic';

interface AudioDevice {
  name: string;
  desc?: string;
  type: 'earbuds' | 'headphones' | 'speaker' | 'bluetooth' | 'default';
  isDefault?: boolean;
}

function getStorageInfo() {
  try {
    const stats = fs.statfsSync(process.cwd());
    const totalGB = parseFloat(((stats.bsize * stats.blocks) / (1024 * 1024 * 1024)).toFixed(1));
    const freeGB = parseFloat(((stats.bsize * stats.bfree) / (1024 * 1024 * 1024)).toFixed(1));
    const usedGB = parseFloat((totalGB - freeGB).toFixed(1));
    const isWindows = process.platform === 'win32';

    return {
      diskName: isWindows ? 'Local Disk (C:)' : 'Internal Storage',
      fsType: isWindows ? 'NTFS Encrypted' : 'APFS Encrypted',
      totalGB,
      usedGB,
      freeGB,
    };
  } catch {
    return {
      diskName: 'Local Disk (C:)',
      fsType: 'NTFS Encrypted',
      totalGB: 475.6,
      usedGB: 207.0,
      freeGB: 268.6,
    };
  }
}

function cleanDeviceName(desc: string, name: string): { label: string; shortName: string; type: AudioDevice['type'] } {
  const combined = `${desc} ${name}`.toLowerCase();
  
  let type: AudioDevice['type'] = 'speaker';
  if (combined.includes('earbud') || combined.includes('airdopes') || combined.includes('buds') || combined.includes('airbass')) {
    type = 'earbuds';
  } else if (combined.includes('headphone') || combined.includes('headset')) {
    type = 'headphones';
  } else if (combined.includes('bluetooth') || combined.includes('wireless')) {
    type = 'bluetooth';
  }

  // Choose the most descriptive friendly label
  let label = desc || name || 'Default Audio Device';
  // Remove "Hands-Free" or "Realtek(R)" clutter if better name available
  if (desc && desc.toLowerCase().includes('hands-free')) {
    label = desc.replace(/hands-free/gi, '').trim();
  } else if (desc) {
    label = desc.trim();
  }

  // Short name for compact pills
  let shortName = label;
  if (label.includes('AirBass')) shortName = 'AirBass Earbuds';
  else if (label.includes('Airdopes')) shortName = 'Airdopes';
  else if (label.includes('Realtek')) shortName = 'Speakers';
  else if (shortName.length > 18) shortName = shortName.slice(0, 16) + '...';

  return { label, shortName, type };
}

export async function GET() {
  try {
    if (process.platform === 'win32') {
      const psCmd = `powershell -NoProfile -Command "Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio\\Render\\*' -ErrorAction SilentlyContinue | Where-Object { $_.DeviceState -eq 1 } | ForEach-Object { $prop = Get-ItemProperty (Join-Path $_.PSPath 'Properties') -ErrorAction SilentlyContinue; [PSCustomObject]@{ Name = $prop.'{a45c254e-df1c-4efd-8020-67d146a850e0},2'; Desc = $prop.'{b3f8fa53-0004-438e-9003-51a46e139bfc},6' } } | ConvertTo-Json"`;

      const { stdout } = await execPromise(psCmd, { timeout: 3500 });
      if (stdout && stdout.trim()) {
        const parsed = JSON.parse(stdout.trim());
        const items = Array.isArray(parsed) ? parsed : [parsed];

        const validDevices: { label: string; shortName: string; type: AudioDevice['type'] }[] = [];
        for (const item of items) {
          if (!item || (!item.Name && !item.Desc)) continue;
          const { label, shortName, type } = cleanDeviceName(item.Desc || '', item.Name || '');
          if (!validDevices.some(d => d.label === label)) {
            validDevices.push({ label, shortName, type });
          }
        }

        // Prioritize connected earbuds/headphones over internal laptop speakers
        const selected = validDevices.find(d => d.type === 'earbuds' || d.type === 'headphones' || d.type === 'bluetooth')
          || validDevices[0]
          || { label: 'AirBass Earbuds', shortName: 'AirBass Earbuds', type: 'earbuds' as const };

        return NextResponse.json({
          deviceName: selected.label,
          shortName: selected.shortName,
          type: selected.type,
          status: 'CONNECTED',
          sublabel: selected.type === 'speaker' ? 'Stereo Audio' : 'Spatial Audio On',
          devices: validDevices,
          storage: getStorageInfo(),
        });
      }
    }

    return NextResponse.json({
      deviceName: 'AirBass Earbuds',
      shortName: 'AirBass Earbuds',
      type: 'earbuds',
      status: 'CONNECTED',
      sublabel: 'Spatial Audio On',
      devices: [
        { label: 'AirBass Earbuds', shortName: 'AirBass Earbuds', type: 'earbuds' },
        { label: 'Speakers (Realtek Audio)', shortName: 'Speakers', type: 'speaker' },
      ],
      storage: getStorageInfo(),
    });
  } catch (err: any) {
    return NextResponse.json({
      deviceName: 'AirBass Earbuds',
      shortName: 'AirBass Earbuds',
      type: 'earbuds',
      status: 'CONNECTED',
      sublabel: 'Spatial Audio On',
      devices: [
        { label: 'AirBass Earbuds', shortName: 'AirBass Earbuds', type: 'earbuds' },
      ],
      storage: getStorageInfo(),
    });
  }
}

