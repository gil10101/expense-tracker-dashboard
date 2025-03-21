import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Get the file and model name from the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const modelName = formData.get('modelName') as string;
    
    if (!file || !modelName) {
      return NextResponse.json(
        { error: 'File or model name missing' },
        { status: 400 }
      );
    }

    // Convert the file to an ArrayBuffer
    const buffer = await file.arrayBuffer();
    
    // Create the models directory if it doesn't exist
    const modelsDir = path.join(process.cwd(), 'public', 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    // Write the file to disk
    const filePath = path.join(modelsDir, modelName);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return NextResponse.json({
      success: true,
      message: `Model ${modelName} saved successfully`,
      path: `/models/${modelName}`
    });
  } catch (error) {
    console.error('Error uploading model:', error);
    return NextResponse.json(
      { error: 'Failed to upload model' },
      { status: 500 }
    );
  }
} 