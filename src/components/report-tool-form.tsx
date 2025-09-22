'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, RefreshCw } from 'lucide-react';

import { generateWaterQualityReport } from '@/ai/flows/generate-water-quality-report';
import type { WaterQualityReportOutput } from '@/ai/flows/generate-water-quality-report';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  location: z.string().min(2, 'Location is required.'),
  sourceType: z.string().min(1, 'Please select a water source.'),
  contaminants: z.string().optional(),
  specificConcerns: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportToolForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaterQualityReportOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      sourceType: '',
      contaminants: '',
      specificConcerns: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setResult(null);
    try {
      const report = await generateWaterQualityReport(values);
      setResult(report);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate water quality report. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }
  
  const handleReset = () => {
    form.reset();
    setResult(null);
  }

  if (result) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Water Quality Report</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{result.report}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommended Purifiers</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
             <p>{result.recommendedPurifiers}</p>
          </CardContent>
        </Card>
        <Button onClick={handleReset} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Start New Report
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Water Source Information</CardTitle>
        <CardDescription>Fill in the details below to generate your report.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (City, State/Country)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Flint, Michigan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water Source Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tap">Tap Water (Municipal)</SelectItem>
                      <SelectItem value="well">Well Water</SelectItem>
                      <SelectItem value="river">River/Lake</SelectItem>
                      <SelectItem value="rainwater">Rainwater Harvesting</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contaminants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Known Contaminants (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lead, High Chlorine, Bacteria" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specificConcerns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Concerns or Requirements (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Water tastes metallic, need water for a baby" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
