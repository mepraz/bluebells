'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import type { CompanyDetails } from '@/lib/types';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, 'Company name is required.'),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompanyDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<CompanyDetails | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        const response = await axios.get('/api/company-details');
        if (response.data) {
          setDetails(response.data);
          form.reset({ name: response.data.name });
        }
      } catch (error) {
        console.error('Failed to fetch company details', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [form]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', values.name);
    if (values.image && values.image[0]) {
      formData.append('image', values.image[0]);
    } else if (details?.logoUrl) {
        formData.append('existingLogoUrl', details.logoUrl);
    }

    try {
      await axios.post('/api/company-details', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Success',
        description: 'Company details updated successfully.',
      });
       // Force a hard reload to reflect changes everywhere
       window.location.reload();
    } catch (error) {
      console.error('Error updating details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8" />
            Company Details
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Company Information</CardTitle>
          <CardDescription>Update your company name and logo.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading && !details ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AquaSwift" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Current Logo</FormLabel>
                <div className="flex items-center gap-4">
                    {details?.logoUrl ? (
                        <Image src={details.logoUrl} alt="logo" width={64} height={64} className="rounded-md bg-muted" />
                    ): (
                        <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                            <Building />
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                        This is your current company logo. Upload a new one below to replace it.
                    </p>
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Upload New Logo</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
