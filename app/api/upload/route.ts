import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: corsHeaders() });

    // 10MB 限制
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB' }, { status: 400, headers: corsHeaders() });
    }

    // 允許的檔案類型
    const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/json'];
    if (!allowedTypes.some(t => file.type.startsWith(t))) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400, headers: corsHeaders() });
    }

    const fileId = uuidv4();
    const ext = file.name.split('.').pop() || '';
    const storagePath = `${fileId}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上傳到 Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 取得公開 URL
    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(storagePath);

    const fileType = file.type.startsWith('image/') ? 'image'
      : file.type === 'application/pdf' ? 'pdf'
      : file.type.startsWith('text/') ? 'text' : 'other';

    return NextResponse.json({
      id: fileId,
      name: file.name,
      type: fileType,
      url: publicUrl,
      size: file.size,
      createdAt: new Date().toISOString(),
    }, { headers: corsHeaders() });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500, headers: corsHeaders() });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}
