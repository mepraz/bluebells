import { Droplets, Wrench, ShieldCheck } from 'lucide-react';
import type { Product, Service, AdminUser } from './types';

export const products: Product[] = [
  {
    id: '1',
    _id: '1',
    name: 'AquaSwift Pro',
    description: 'Advanced 10-stage purification for crystal clear water. Ideal for homes and offices.',
    price: 299.99,
    imageUrl: 'https://picsum.photos/600/400?random=1',
    features: ['10-Stage Purification', 'Smart Monitoring', 'Mineral Booster', 'Energy-Saving Mode'],
    aiHint: 'water purifier',
  },
  {
    id: '2',
    _id: '2',
    name: 'AquaSwift Compact',
    description: 'A sleek and compact purifier perfect for small kitchens and apartments.',
    price: 149.99,
    imageUrl: 'https://picsum.photos/600/400?random=2',
    features: ['5-Stage RO+UV', 'Space-Saving Design', 'Quick-Change Filters', 'Leak-proof'],
    aiHint: 'kitchen appliance',
  },
  {
    id: '3',
    _id: '3',
    name: 'AquaSwift Tank+',
    description: 'High-capacity purifier with a large storage tank, ensuring water is always available.',
    price: 399.99,
    imageUrl: 'https://picsum.photos/600/400?random=3',
    features: ['12L Storage Tank', 'RO+UV+UF', 'TDS Controller', 'Stainless Steel Body'],
    aiHint: 'water filter',
  },
  {
    id: '4',
    _id: '4',
    name: 'AquaSwift Go',
    description: 'Portable water purifier bottle for safe drinking water on the go.',
    price: 49.99,
    imageUrl: 'https://picsum.photos/600/400?random=4',
    features: ['Portable Design', 'Multi-layer Filter', 'BPA-Free Material', '750ml Capacity'],
    aiHint: 'water bottle',
  },
];

export const services: Service[] = [
  {
    id: '1',
    name: 'Standard Installation',
    description: 'Professional installation by our certified technicians to ensure your purifier works perfectly from day one.',
    icon: Wrench,
  },
  {
    id: '2',
    name: 'Annual Maintenance Contract',
    description: 'Comprehensive annual check-ups, filter replacements, and cleaning to prolong the life of your purifier.',
    icon: ShieldCheck,
  },
  {
    id: '3',
    name: 'On-Demand Repairs',
    description: 'Fast and reliable repair services for any issues you might face with your water purifier.',
    icon: Droplets,
  },
];

export const adminUsers: AdminUser[] = [
    { id: '1', username: 'user', role: 'Super Admin', lastLogin: '2024-07-30 10:00 AM' },
    { id: '2', username: 'jane.doe', role: 'Product Manager', lastLogin: '2024-07-29 02:45 PM' },
];
