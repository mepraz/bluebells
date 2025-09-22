"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Droplets,
  FlaskConical,
  LifeBuoy,
  Loader2,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { services } from "@/lib/data";
import { useEffect, useState } from "react";
import type { Product, Testimonial } from "@/lib/types";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const heroImages = [
  {
    src: "https://www.aquasana.com/dw/image/v2/BDTV_PRD/on/demandware.static/-/Sites-aquasana-Library/default/dw4870658c/RO-min.png",
    alt: "Modern kitchen with water purifier",
    hint: "kitchen purifier",
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get("/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products.",
        });
      } finally {
        setLoadingProducts(false);
      }
    }

    async function fetchTestimonials() {
      try {
        const response = await axios.get("/api/testimonials");
        setTestimonials(response.data);
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      } finally {
        setLoadingTestimonials(false);
      }
    }

    fetchProducts();
    fetchTestimonials();
  }, [toast]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full text-white">
        <Carousel
          className="w-full h-full"
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
        >
          <CarouselContent className="h-full">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="relative h-full z-0">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  data-ai-hint={image.hint}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
        </Carousel>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Hero Text */}
        <div className="absolute inset-0 flex items-center justify-center text-center z-20">
          <div className="container px-4 md:px-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Pure Water, Pure Life.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
              Experience the future of water purification with AquaSwift.
              Uncompromised quality for a healthier you.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/products">Explore Products</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/report-tool">Analyze Your Water</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Our Star Purifiers
            </h2>
            <p className="mt-2 text-muted-foreground md:text-lg">
              Engineered for perfection, designed for your home.
            </p>
          </div>
          {loadingProducts ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <Carousel
              opts={{ loop: true, align: "start" }}
              className="max-w-7xl mx-auto"
            >
              <CarouselContent className="-ml-4">
                {products.slice(0, 4).map((product) => (
                  <CarouselItem
                    key={product._id}
                    className="md:basis-1/2 lg:basis-1/4 pl-4"
                  >
                    <Card className="overflow-hidden transform hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                      <CardHeader className="p-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={600}
                          height={400}
                          className="object-cover w-full h-48"
                          data-ai-hint={product.aiHint}
                        />
                      </CardHeader>
                      <CardContent className="p-4 flex flex-col flex-grow">
                        <h3 className="font-semibold text-lg">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 h-10 flex-grow">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <p className="text-lg font-bold text-primary">
                            ${product.price}
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/products`}>View Details</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12" />
              <CarouselNext className="right-0 md:-right-12" />
            </Carousel>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 md:py-24 bg-secondary/50">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="https://www.solarfilternepal.com/public/images/upload/product/wave-deluxe.jpg"
              alt="NKPurifier water purifier installation"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
              data-ai-hint="water purifier installation"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">About NKPurifier</h2>
            <p className="text-muted-foreground md:text-lg">
              Founded on the principle that everyone deserves access to clean
              and safe water, NKPurifier has been a pioneer in the water
              purification industry for over a decade. We combine cutting-edge
              technology with user-centric design to create products that are
              not only effective but also a seamless addition to your home.
            </p>
            <p className="text-muted-foreground md:text-lg">
              Our mission is to innovate and provide reliable solutions that
              contribute to a healthier lifestyle for our customers and a
              healthier planet.
            </p>
          </div>
        </div>
      </section>

      {/* AI Tool CTA */}
      <section className="bg-background py-16 md:py-24">
        <div className="container grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
              Powered by GenAI
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Uncertain About Your Water Quality?
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Our AI-powered tool analyzes your water source details to generate
              a comprehensive quality report and recommends the perfect
              AquaSwift purifier for your specific needs.
            </p>
            <Button size="lg" asChild>
              <Link href="/report-tool">Get Your Free Report</Link>
            </Button>
          </div>
          <div className="flex justify-center">
            <Image
              src="https://th.bing.com/th/id/R.51cd8eb534503c3499bf2751fca7222a?rik=BK0wVj4n4rYCwA&pid=ImgRaw&r=0"
              alt="Water quality analysis icon"
              width={400}
              height={400}
              className="rounded-full"
              data-ai-hint="water analysis"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              What Our Customers Say
            </h2>
            <p className="mt-2 text-muted-foreground md:text-lg">
              Real stories from happy AquaSwift users.
            </p>
          </div>
          {loadingTestimonials ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <Carousel opts={{ loop: true }} className="max-w-4xl mx-auto">
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem key={testimonial._id}>
                    <Card className="border-none shadow-none bg-transparent">
                      <CardContent className="p-6 md:p-10 text-center flex flex-col items-center">
                        <Quote className="w-10 h-10 text-primary mb-4" />
                        <p className="text-lg md:text-xl font-medium mb-4 max-w-2xl">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center space-x-4">
                          <Image
                            src={testimonial.imageUrl}
                            alt={testimonial.name}
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                            data-ai-hint={testimonial.aiHint}
                          />
                          <div>
                            <p className="font-semibold text-lg">
                              {testimonial.name}
                            </p>
                            <p className="text-muted-foreground">
                              {testimonial.company}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12" />
              <CarouselNext className="right-0 md:-right-12" />
            </Carousel>
          )}
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Service You Can Count On
            </h2>
            <p className="mt-2 text-muted-foreground md:text-lg">
              We're with you every step of the way.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <service.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle>{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
