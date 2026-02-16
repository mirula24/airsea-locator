// types/index.ts
export interface NodeData {
  node_id: string;
  name: string;
  short_name: string;
  hardware: string;
  battery: number;
  voltage: number;
  snr: number;
  hops_away: number;
  last_heard: number;
  gps: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: number;
  pushed_at: string;
}

export interface Summary {
  total_nodes: number;
  gps_nodes: number;
  changed: number;
  timestamp: number;
  cycle: number;
}

export type IconType = 'tower' | 'drone' | 'human' | 'car' | 'ship' | 'bicycle';

export interface NodeIcon {
  node_id: string;
  icon_type: IconType;
}

// Konversi waktu UTC ke WIB (UTC+7)
export function toWIB(utcTimestamp: number): string {
  const date = new Date(utcTimestamp * 1000);
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}