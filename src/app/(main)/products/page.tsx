'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load products.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [toast]);


  return (
    <div className="bg-background">
      <div className="container py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Product Catalog</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Find the perfect water purifier that fits your needs and lifestyle.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product._id} className="flex flex-col">
                <CardHeader className="p-0">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={600}
                    height={400}
                    className="object-cover w-full h-56 rounded-t-lg"
                    data-ai-hint={product.aiHint}
                  />
                </CardHeader>
                <CardContent className="pt-6 flex-grow">
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription className="mt-2">{product.description}</CardDescription>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-primary">${product.price}</p>
                  <Button>Add to Cart</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
