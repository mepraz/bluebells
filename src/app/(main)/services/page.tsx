import { services } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <div className="bg-secondary/30">
      <div className="container py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Expert Services</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Ensuring your AquaSwift purifier performs at its best, always.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="items-center">
                <div className="p-5 bg-primary/10 rounded-full inline-flex">
                  <service.icon className="w-10 h-10 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="mt-2">
                  {service.description}
                </CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                 <Button variant="outline">Learn More</Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-16 text-center bg-card p-8 rounded-lg border">
            <h2 className="text-2xl font-bold">Need Help?</h2>
            <p className="text-muted-foreground mt-2">Our support team is ready to assist you with any questions or issues.</p>
            <Button asChild className="mt-4">
                <Link href="/contact">Contact Support</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
