// app/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import mqtt from 'mqtt';
import dynamic from 'next/dynamic';
import NodeList from '@/components/NodeList';
import NodeDetailModal from '@/components/NodeDetailModal';
import { NodeData, Summary, IconType } from '@/types';
import { Menu, Wifi, WifiOff } from 'lucide-react';

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { ssr: false });

// Definisikan tipe untuk track
type TrackPoint = [number, number]; // Tuple untuk latitude, longitude
type TracksState = Record<string, TrackPoint[]>;

export default function Home() {
  const [nodes, setNodes] = useState<Record<string, NodeData>>({});
  const [tracks, setTracks] = useState<TracksState>({});
  const [summary, setSummary] = useState<Summary | null>(null);
  const [connected, setConnected] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  
  // State untuk ikon per node
  const [nodeIcons, setNodeIcons] = useState<Record<string, IconType>>({});
  const [openIconSelector, setOpenIconSelector] = useState<string | null>(null);

  // Fungsi untuk mengupdate track perpindahan node
  const updateTrack = useCallback((nodeId: string, newLat: number, newLng: number) => {
    setTracks((prev: TracksState) => {
      const current = prev[nodeId] || [];
      
      // Jika belum ada track, buat baru
      if (current.length === 0) {
        return {
          ...prev,
          [nodeId]: [[newLat, newLng]] as TrackPoint[]
        };
      }
      
      // Cek apakah posisi berubah signifikan (lebih dari ~10 meter)
      const last = current[current.length - 1];
      
      // Hitung jarak dalam meter (aproksimasi)
      const R = 6371000; // Radius bumi dalam meter
      const lat1 = last[0] * Math.PI / 180;
      const lat2 = newLat * Math.PI / 180;
      const deltaLat = (newLat - last[0]) * Math.PI / 180;
      const deltaLon = (newLng - last[1]) * Math.PI / 180;
      
      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance > 10) { // lebih dari 10 meter
        // Buat track point baru
        const newPoint: TrackPoint = [newLat, newLng];
        const newTrack = [...current, newPoint] as TrackPoint[];
        
        // Batasi maksimal 200 titik per track
        if (newTrack.length > 200) {
          newTrack.shift();
        }
        
        return {
          ...prev,
          [nodeId]: newTrack
        };
      }
      
      return prev;
    });
  }, []);

  // Fungsi untuk menambah track pertama kali
  const initializeTrack = useCallback((nodeId: string, lat: number, lng: number) => {
    setTracks((prev: TracksState) => {
      if (!prev[nodeId]) {
        return {
          ...prev,
          [nodeId]: [[lat, lng]] as TrackPoint[]
        };
      }
      return prev;
    });
  }, []);

  // Koneksi MQTT
  useEffect(() => {
    // Coba beberapa port WebSocket umum
    const connectToBroker = () => {
      const client = mqtt.connect('wss://128.199.209.239/mqtt', {
        connectTimeout: 5000,
        reconnectPeriod: 5000,
      });

      client.on('connect', () => {
        console.log('Terhubung ke MQTT broker');
        setConnected(true);
        
        client.subscribe('airsea/base/nodes/+', (err) => {
          if (err) console.error('Subscribe nodes error:', err);
        });
        
        client.subscribe('airsea/base/summary', (err) => {
          if (err) console.error('Subscribe summary error:', err);
        });
      });

      client.on('message', (topic, message) => {
        const payload = message.toString();
        try {
          if (topic.startsWith('airsea/base/nodes/')) {
            const nodeData: NodeData = JSON.parse(payload);
            
            setNodes(prev => {
              const prevNode = prev[nodeData.node_id];
              
              // Update track jika posisi berubah
              if (nodeData.gps && nodeData.latitude !== 0 && nodeData.longitude !== 0) {
                if (!prevNode) {
                  // Node baru, inisialisasi track
                  initializeTrack(nodeData.node_id, nodeData.latitude, nodeData.longitude);
                } else if (
                  prevNode.latitude !== nodeData.latitude || 
                  prevNode.longitude !== nodeData.longitude
                ) {
                  // Posisi berubah, update track
                  updateTrack(nodeData.node_id, nodeData.latitude, nodeData.longitude);
                }
              }
              
              return { ...prev, [nodeData.node_id]: nodeData };
            });
            
          } else if (topic === 'airsea/base/summary') {
            const summaryData: Summary = JSON.parse(payload);
            setSummary(summaryData);
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      });

      client.on('error', (err) => {
        console.error('MQTT error:', err);
        setConnected(false);
      });

      client.on('close', () => {
        setConnected(false);
      });

      return client;
    };

    const client = connectToBroker();

    return () => {
      if (client) {
        client.end(true);
      }
    };
  }, [updateTrack, initializeTrack]);

  // Fungsi untuk mengganti ikon node
  const handleIconChange = (nodeId: string, icon: IconType) => {
    setNodeIcons(prev => ({
      ...prev,
      [nodeId]: icon
    }));
  };

  // Toggle icon selector
  const toggleIconSelector = (nodeId: string) => {
    setOpenIconSelector(prev => prev === nodeId ? null : nodeId);
  };

  // Tutup icon selector saat klik di luar
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenIconSelector(null);
    };
    
    if (openIconSelector) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openIconSelector]);

  // Filter node GPS valid
  const gpsNodes = Object.values(nodes).filter(
    node => node.gps && node.latitude !== 0 && node.longitude !== 0
  );

  // Hitung statistik
  const totalGpsNodes = gpsNodes.length;
  const totalTracks = Object.keys(tracks).length;

  // Fungsi untuk format waktu WIB
  const formatWIB = (date: Date = new Date()) => {
    return date.toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <main className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold tracking-tight">📍 AirSea Locator</h1>
          <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">Real-time Tracking</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Status Koneksi */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            connected ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-sm">{connected ? 'Terhubung' : 'Putus'}</span>
          </div>
          
          {/* Summary Info */}
          {summary && (
            <div className="flex items-center space-x-3 bg-gray-700 px-3 py-1 rounded-full">
              <span className="text-sm">📡 Total: {summary.total_nodes}</span>
              <span className="text-sm">📍 GPS: {summary.gps_nodes}</span>
              <span className="text-sm">🔄 Cycle: {summary.cycle}</span>
            </div>
          )}
          
          {/* Waktu sekarang WIB */}
          <div className="text-sm bg-gray-700 px-3 py-1 rounded-full">
            {formatWIB()} WIB
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <NodeList 
          nodes={nodes}
          nodeIcons={nodeIcons}
          onIconChange={handleIconChange}
          onNodeSelect={setSelectedNode}
          openIconSelector={openIconSelector}
          onToggleIconSelector={toggleIconSelector}
        />
        
        {/* Map Container */}
        <div className="flex-1 relative">
          {gpsNodes.length > 0 ? (
            <MapWithNoSSR
              nodes={gpsNodes}
              tracks={tracks}
              nodeIcons={nodeIcons}
              onIconChange={handleIconChange}
              onMarkerClick={setSelectedNode}
              openIconSelector={openIconSelector}
              onToggleIconSelector={toggleIconSelector}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-200">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-lg">Tidak ada node dengan GPS aktif</p>
                <p className="text-sm mt-2">Menunggu data dari MQTT...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Node */}
      <NodeDetailModal node={selectedNode} onClose={() => setSelectedNode(null)} />
    </main>
  );
}