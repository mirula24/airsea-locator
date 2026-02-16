// components/NodeList.tsx
'use client';

import { NodeData, IconType, toWIB } from '@/types';
import { Info, MapPin, Battery, Wifi, Clock } from 'lucide-react';
import IconSelector from './IconSelector';

interface NodeListProps {
  nodes: Record<string, NodeData>;
  nodeIcons: Record<string, IconType>;
  onIconChange: (nodeId: string, icon: IconType) => void;
  onNodeSelect: (node: NodeData) => void;
  openIconSelector: string | null;
  onToggleIconSelector: (nodeId: string) => void;
}

export default function NodeList({ 
  nodes, 
  nodeIcons, 
  onIconChange, 
  onNodeSelect,
  openIconSelector,
  onToggleIconSelector
}: NodeListProps) {
  
  const getBatteryColor = (battery: number) => {
    if (battery > 70) return 'text-green-600';
    if (battery > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 p-4 overflow-auto border-r border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">📡 Nodes</h2>
        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
          {Object.keys(nodes).length} Total
        </span>
      </div>
      
      <ul className="space-y-3">
        {Object.values(nodes)
          .sort((a, b) => b.last_heard - a.last_heard)
          .map(node => (
            <li 
              key={node.node_id} 
              className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden"
            >
              {/* Header dengan status GPS */}
              <div className={`px-3 py-1 text-xs text-white flex justify-between items-center ${
                node.gps && node.latitude !== 0 ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                <span className="flex items-center">
                  <MapPin size={12} className="mr-1" />
                  {node.gps && node.latitude !== 0 ? 'GPS Aktif' : 'GPS Tidak Aktif'}
                </span>
                <span>{node.short_name}</span>
              </div>
              
              {/* Konten utama */}
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{node.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{node.node_id}</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <IconSelector
                      nodeId={node.node_id}
                      currentIcon={nodeIcons[node.node_id] || 'tower'}
                      onIconChange={onIconChange}
                      isOpen={openIconSelector === node.node_id}
                      onToggle={() => onToggleIconSelector(node.node_id)}
                    />
                    <button 
                      onClick={() => onNodeSelect(node)} 
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition"
                      title="Detail node"
                    >
                      <Info size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="flex items-center text-gray-600">
                    <Battery size={12} className="mr-1" />
                    <span className={getBatteryColor(node.battery)}>
                      {node.battery}% ({node.voltage.toFixed(2)}V)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Wifi size={12} className="mr-1" />
                    <span>SNR: {node.snr}dB</span>
                  </div>
                </div>
                
                {/* Lokasi jika ada GPS */}
                {node.gps && node.latitude !== 0 && (
                  <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                    <div className="font-mono text-gray-700">
                      {node.latitude.toFixed(6)}, {node.longitude.toFixed(6)}
                    </div>
                    <div className="text-gray-500 mt-1">
                      Alt: {node.altitude}m
                    </div>
                  </div>
                )}
                
                {/* Waktu terakhir */}
                <div className="mt-2 flex items-center text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <Clock size={12} className="mr-1" />
                  <span>{toWIB(node.last_heard)}</span>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}