'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Package, Wrench, Users, Loader2 } from "lucide-react"
import { services, adminUsers } from "@/lib/data"
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import axios from "axios";

export default function Dashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await axios.get('/api/products');
                setProducts(response.data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

  const stats = [
    { title: "Total Products", value: loading ? <Loader2 className="h-4 w-4 animate-spin" /> : products.length, icon: Package },
    { title: "Total Services", value: services.length, icon: Wrench },
    { title: "Admin Users", value: adminUsers.length, icon: Users },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                Currently in the system
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>
            From here, you can manage all aspects of the AquaSwift website. Use the navigation on the left to manage products, services, and users.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p>This panel provides full control over the dynamic content of your application. Remember to save your changes after editing.</p>
        </CardContent>
      </Card>
    </div>
  )
}
