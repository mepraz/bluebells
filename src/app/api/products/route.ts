import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import axios from 'axios';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const products = await db.collection('products').find({}).toArray();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const features = formData.get('features') as string;
    const aiHint = formData.get('aiHint') as string;
    const image = formData.get('image') as File;

    if (!image) {
        return NextResponse.json({ message: 'Image is required' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const imageBase64 = imageBuffer.toString('base64');

    const imgbbApiKey = process.env.IMGBB_API_KEY;
    const imgbbResponse = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      new URLSearchParams({ image: imageBase64 })
    );

    if (!imgbbResponse.data.success) {
      throw new Error(`ImgBB upload failed: ${imgbbResponse.data.error.message}`);
    }

    const imageUrl = imgbbResponse.data.data.url;

    const client = await clientPromise;
    const db = client.db();

    const newProduct = {
      name,
      description,
      price: parseFloat(price),
      features: features.split(',').map(f => f.trim()),
      aiHint,
      imageUrl,
    };

    const result = await db.collection('products').insertOne(newProduct);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ message: 'Error adding product' }, { status: 500 });
  }
}
