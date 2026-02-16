// components/Map.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { NodeData, IconType, toWIB } from '@/types';
import { useEffect, useRef } from 'react';
import IconSelector from './IconSelector';

interface MapProps {
  nodes: NodeData[];
  tracks: Record<string, [number, number][]>;
  nodeIcons: Record<string, IconType>;
  onIconChange: (nodeId: string, icon: IconType) => void;
  onMarkerClick: (node: NodeData) => void;
  openIconSelector: string | null;
  onToggleIconSelector: (nodeId: string) => void;
}

// Fungsi untuk mendapatkan ikon berdasarkan tipe
const getIconForType = (type: IconType, isSelected: boolean = false) => {
  const iconHtml = {
    tower: '🗼',
    drone: '🛸',
    human: '🧑',
    car: '🚗',
    ship: '🚢',
    bicycle: '🚲',
  }[type] || '📍';

  const size = isSelected ? 40 : 32;
  
  return L.divIcon({
    html: `<div style="font-size: ${size}px; line-height: 1; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">${iconHtml}</div>`,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size],
  });
};

// Fungsi untuk mendapatkan warna track berdasarkan node ID
const getTrackColor = (nodeId: string) => {
  let hash = 0;
  for (let i = 0; i < nodeId.length; i++) {
    hash = nodeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 55%)`;
};

export default function Map({ 
  nodes, 
  tracks, 
  nodeIcons, 
  onIconChange, 
  onMarkerClick,
  openIconSelector,
  onToggleIconSelector
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Set center ke node pertama atau default Jakarta
  const center = nodes.length > 0 && nodes[0].latitude !== 0
    ? [nodes[0].latitude, nodes[0].longitude] as [number, number]
    : [-6.2088, 106.8456] as [number, number]; // Jakarta pusat

  // Pastikan marker icon diperbaiki
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      preferCanvas={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Gambar track untuk setiap node */}
      {Object.entries(tracks).map(([nodeId, track]) => {
        if (track.length < 2) return null;
        return (
          <Polyline
            key={`track-${nodeId}`}
            positions={track}
            color={getTrackColor(nodeId)}
            weight={3}
            opacity={0.6}
            dashArray={track.length > 10 ? "5, 5" : undefined}
          />
        );
      })}

      {/* Marker untuk setiap node GPS */}
      {nodes.map(node => {
        const iconType = nodeIcons[node.node_id] || 'tower';
        const isSelected = openIconSelector === node.node_id;
        
        return (
          <Marker
            key={node.node_id}
            position={[node.latitude, node.longitude]}
            icon={getIconForType(iconType, isSelected)}
            eventHandlers={{
              click: () => onMarkerClick(node),
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-base">{node.name} ({node.short_name})</h3>
                  <div onClick={(e) => e.stopPropagation()}>
                    <IconSelector
                      nodeId={node.node_id}
                      currentIcon={iconType}
                      onIconChange={onIconChange}
                      isOpen={openIconSelector === node.node_id}
                      onToggle={() => onToggleIconSelector(node.node_id)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p><span className="font-semibold">Hardware:</span> {node.hardware}</p>
                  <p><span className="font-semibold">Baterai:</span> {node.battery}% ({node.voltage.toFixed(2)}V)</p>
                  <p><span className="font-semibold">SNR:</span> {node.snr} dB</p>
                  <p><span className="font-semibold">Altitude:</span> {node.altitude} m</p>
                  <p><span className="font-semibold">Terakhir:</span> {toWIB(node.last_heard)}</p>
                  {tracks[node.node_id] && (
                    <p><span className="font-semibold">Pergerakan:</span> {tracks[node.node_id].length} titik</p>
                  )}
                </div>
                
                <button
                  onClick={() => onMarkerClick(node)}
                  className="mt-2 w-full bg-blue-500 text-white text-xs py-1 rounded hover:bg-blue-600 transition"
                >
                  Detail Lengkap
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}