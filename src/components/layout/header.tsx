"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CompanyDetails } from "@/lib/types";
import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/report-tool", label: "Water Quality AI" },
];

export default function Header() {
  const pathname = usePathname();
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanyDetails() {
      try {
        const response = await axios.get("/api/company-details");
        setCompanyDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch company details", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyDetails();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center space-x-2">
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : companyDetails?.logoUrl ? (
            <img
              src={companyDetails.logoUrl}
              alt="logo"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted" />
          )}
          <span className="font-semibold text-lg tracking-tight">
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              companyDetails?.name || "AquaSwift"
            )}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative transition-colors hover:text-primary after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                pathname === link.href
                  ? "text-primary after:w-full"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] sm:w-[300px]">
              <div className="flex items-center space-x-2 mb-6">
                {companyDetails?.logoUrl && (
                  <img
                    src={companyDetails.logoUrl}
                    alt="logo"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="font-semibold text-lg">
                  {companyDetails?.name || "AquaSwift"}
                </span>
              </div>
              <div className="flex flex-col space-y-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-primary",
                      pathname === link.href
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
