'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Search, Bell, User } from 'lucide-react';
import MailAIDashboard from '@/components/MailDashboard';

export default function Home() {
  // const [activeTab, setActiveTab] = useState('inbox');

  return (
    
    <MailAIDashboard /> 
  );
}