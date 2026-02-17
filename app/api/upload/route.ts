import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// 設定 CORS 標頭
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
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 檢查檔案大小 (限制 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 檢查檔案類型
    const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/json'];
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 建立 uploads 資料夾
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // 產生唯一檔名
    const fileId = uuidv4();
    const originalName = file.name;
    const extension = originalName.split('.').pop() || '';
    const fileName = `${fileId}.${extension}`;
    const filePath = join(uploadDir, fileName);

    // 將檔案轉換為 buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 寫入檔案
    await writeFile(filePath, buffer);

    // 回傳檔案資訊
    const fileType = file.type.startsWith('image/') ? 'image' :
                     file.type === 'application/pdf' ? 'pdf' :
                     file.type.startsWith('text/') ? 'text' : 'other';

    return NextResponse.json({
      id: fileId,
      name: originalName,
      type: fileType,
      url: `/uploads/${fileName}`,
      size: file.size,
      createdAt: new Date().toISOString(),
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}