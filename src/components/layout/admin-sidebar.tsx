'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Wrench,
  Users,
  LogOut,
  Building,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { CompanyDetails } from '@/lib/types';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Skeleton } from '../ui/skeleton';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/company', label: 'Company', icon: Building },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanyDetails() {
      try {
        const response = await axios.get('/api/company-details');
        setCompanyDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch company details', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyDetails();
  }, [pathname]); // Refetch on path change to get updates

  const handleLogout = () => {
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
    router.push('/login');
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
            {loading ? (
                <Skeleton className="h-6 w-6 rounded-full" />
            ) : companyDetails?.logoUrl ? (
                <Image src={companyDetails.logoUrl} alt="logo" width={24} height={24} className="rounded-full" />
            ) : null}
          <span className="text-lg font-semibold">{loading ? <Skeleton className="h-6 w-24" /> : companyDetails?.name || 'AquaSwift'}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  className={cn(
                    'w-full justify-start',
                    pathname.startsWith(item.href) && 'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="size-4" />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
