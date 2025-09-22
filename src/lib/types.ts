import type { LucideIcon } from 'lucide-react';

export type Product = {
  id: string;
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  features: string[];
  aiHint: string;
};

export type Service = {
  id:string;
  name: string;
  description: string;
  icon: LucideIcon;
};

export type AdminUser = {
  id: string;
  username: string;
  role: string;
  lastLogin: string;
};

export type Testimonial = {
  _id: string;
  name: string;
  company: string;
  quote: string;
  imageUrl: string;
  aiHint: string;
};

export type CompanyDetails = {
    _id: string;
    name: string;
    logoUrl: string;
};
