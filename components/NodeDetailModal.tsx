// components/NodeDetailModal.tsx
'use client';

import { NodeData, toWIB } from '@/types';
import { X, Battery, Wifi, MapPin, Clock, Cpu, Activity, Hash } from 'lucide-react';

interface NodeDetailModalProps {
  node: NodeData | null;
  onClose: () => void;
}

export default function NodeDetailModal({ node, onClose }: NodeDetailModalProps) {
  if (!node) return null;

  const InfoCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center text-gray-500 text-xs mb-1">
        <Icon size={14} className="mr-1" />
        <span>{label}</span>
      </div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{node.name}</h2>
            <p className="text-sm text-gray-500">{node.short_name} • {node.node_id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <InfoCard 
              label="Battery" 
              value={`${node.battery}% (${node.voltage.toFixed(3)}V)`}
              icon={Battery}
            />
            <InfoCard 
              label="SNR" 
              value={`${node.snr} dB`}
              icon={Wifi}
            />
            <InfoCard 
              label="Hardware" 
              value={node.hardware}
              icon={Cpu}
            />
            <InfoCard 
              label="Hops Away" 
              value={node.hops_away.toString()}
              icon={Activity}
            />
            <InfoCard 
              label="GPS Status" 
              value={node.gps ? 'Aktif' : 'Tidak Aktif'}
              icon={MapPin}
            />
            <InfoCard 
              label="Altitude" 
              value={`${node.altitude} m`}
              icon={MapPin}
            />
          </div>

          {/* Koordinat GPS */}
          {node.gps && node.latitude !== 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <MapPin size={16} className="mr-1" />
                Koordinat GPS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-blue-600">Latitude</div>
                  <div className="font-mono text-sm">{node.latitude.toFixed(7)}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600">Longitude</div>
                  <div className="font-mono text-sm">{node.longitude.toFixed(7)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
              <Clock size={16} className="mr-1" />
              Waktu (WIB)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Heard:</span>
                <span className="font-mono">{toWIB(node.last_heard)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-mono">{toWIB(node.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pushed At:</span>
                <span className="font-mono">{new Date(node.pushed_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</span>
              </div>
            </div>
          </div>

          {/* Raw Data */}
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
            <h3 className="text-sm font-mono mb-2 text-gray-400 flex items-center">
              <Hash size={14} className="mr-1" />
              Raw JSON Data
            </h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(node, null, 2)}
            </pre>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}