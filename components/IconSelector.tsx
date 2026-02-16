// components/IconSelector.tsx
'use client';

import { IconType } from '@/types';
import { 
  TowerControl as Tower, 
  Cpu as Drone, 
  User, 
  Car, 
  Ship, 
  Bike 
} from 'lucide-react';

interface IconSelectorProps {
  nodeId: string;
  currentIcon: IconType;
  onIconChange: (nodeId: string, icon: IconType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const iconOptions: { type: IconType; icon: React.ReactNode; label: string }[] = [
  { type: 'tower', icon: <Tower size={16} />, label: 'Tower' },
  { type: 'drone', icon: <Drone size={16} />, label: 'Drone' },
  { type: 'human', icon: <User size={16} />, label: 'Human' },
  { type: 'car', icon: <Car size={16} />, label: 'Car' },
  { type: 'ship', icon: <Ship size={16} />, label: 'Ship' },
  { type: 'bicycle', icon: <Bike size={16} />, label: 'Bicycle' },
];

export default function IconSelector({ nodeId, currentIcon, onIconChange, isOpen, onToggle }: IconSelectorProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-1 hover:bg-gray-200 rounded-full transition"
        title="Ganti icon"
      >
        {iconOptions.find(opt => opt.type === currentIcon)?.icon || <Tower size={16} />}
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} />
          <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[120px]">
            {iconOptions.map(option => (
              <button
                key={option.type}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2 first:rounded-t-lg last:rounded-b-lg ${
                  currentIcon === option.type ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => {
                  onIconChange(nodeId, option.type);
                  onToggle();
                }}
              >
                <span className="inline-block w-5">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}