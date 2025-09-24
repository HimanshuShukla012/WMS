// components/Tabs/TabNavigation.tsx - Navigation tabs for different sections

import React from 'react';
import { BarChart3, Users, Zap, DollarSign, Droplets, MessageSquare } from 'lucide-react';
import { TabType } from '../../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    { id: 'infrastructure', label: 'Infrastructure', icon: Zap },
    { id: 'finance', label: 'Financial', icon: DollarSign },
    { id: 'quality', label: 'Water Quality', icon: Droplets },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
  ] as const;

  return (
    <div className="bg-white rounded-xl shadow-lg p-2">
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};