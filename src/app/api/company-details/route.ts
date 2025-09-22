import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const details = await db.collection('company_details').findOne({});
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json({ message: 'Error fetching company details' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const image = formData.get('image') as File | null;
    const existingLogoUrl = formData.get('existingLogoUrl') as string | null;

    let logoUrl = existingLogoUrl;

    if (image) {
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
      logoUrl = imgbbResponse.data.data.url;
    }

    const client = await clientPromise;
    const db = client.db();

    const detailsToUpdate = {
      name,
      logoUrl,
    };

    const result = await db.collection('company_details').updateOne(
      {},
      { $set: detailsToUpdate },
      { upsert: true }
    );
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error updating company details:', error);
    return NextResponse.json({ message: 'Error updating company details' }, { status: 500 });
  }
}
