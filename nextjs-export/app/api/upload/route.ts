import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided for upload.' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `elevations/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      // Upload file buffer to Supabase Storage bucket 'project-images'
      const { data, error } = await supabaseServer.storage
        .from('project-images')
        .upload(fileName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('[Supabase Storage Upload Error]:', error);
        continue;
      }

      if (data) {
        const { data: publicUrlData } = supabaseServer.storage
          .from('project-images')
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedUrls.length} photos to Supabase Storage.`,
      urls: uploadedUrls,
    });
  } catch (err: any) {
    console.error('[API /api/upload Exception]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Image upload failed.' },
      { status: 500 }
    );
  }
}
