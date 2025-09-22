'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import axios from 'axios';
import type { CompanyDetails } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export default function Footer() {
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
    }, []);

  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-start space-y-2">
            <Link href="/" className="flex items-center space-x-2">
                {loading ? (
                    <Skeleton className="h-8 w-8 rounded-full" />
                ) : companyDetails?.logoUrl ? (
                    <Image src={companyDetails.logoUrl} alt="logo" width={24} height={24} className="rounded-full" />
                ) : null}
                <span className="font-bold">{loading ? <Skeleton className="h-6 w-24" /> : companyDetails?.name || 'AquaSwift'}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Pure Water, Pure Life.
            </p>
          </div>
          <div className="flex flex-col space-y-2 text-sm">
            <h4 className="font-semibold">Company</h4>
            <Link href="/products" className="text-muted-foreground hover:text-primary">Products</Link>
            <Link href="/services" className="text-muted-foreground hover:text-primary">Services</Link>
            <Link href="#about" className="text-muted-foreground hover:text-primary">About Us</Link>
          </div>
          <div className="flex flex-col space-y-2 text-sm">
            <h4 className="font-semibold">Support</h4>
            <Link href="#" className="text-muted-foreground hover:text-primary">FAQ</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link>
            <Link href="/report-tool" className="text-muted-foreground hover:text-primary">Water Quality AI</Link>
          </div>
           <div className="flex flex-col space-y-2 text-sm">
            <h4 className="font-semibold">Legal</h4>
            <Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {companyDetails?.name || 'AquaSwift'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
