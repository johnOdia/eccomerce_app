import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path"; // Import the path module

export async function GET(
  req: NextRequest,
  {
    params: { downloadVerificationId },
  }: { params: { downloadVerificationId: string } }
) {
  // Validate downloadVerificationId
  if (!downloadVerificationId) {
    console.error("downloadVerificationId is missing");
    return NextResponse.redirect(new URL("/products/download/expired", req.url));
  }

  // Fetch data from the database
  const data = await db.downloadVerification.findUnique({
    where: { 
      id: downloadVerificationId, 
      expiresAt: { gt: new Date() } 
    },
    select: { product: { select: { filePath: true, name: true } } },
  });

  // Handle case when no valid data is found
  if (data == null) {
    console.error(`No valid download found for id: ${downloadVerificationId}`);
    return NextResponse.redirect(new URL("/products/download/expired", req.url));
  }

  // Construct the file path relative to the public directory
  const filePath = path.resolve(process.cwd(), 'public', data.product.filePath);

  try {
    // Check file stats and read the file
    const { size } = await fs.stat(filePath);
    const file = await fs.readFile(filePath);
    const extension = data.product.filePath.split(".").pop();

    // Return the file as a response with headers for download
    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
        "Content-Length": size.toString(),
      },
      
    });
  } catch (error) {
    console.error("File operation failed:", error);
    return NextResponse.redirect(new URL("/products/download/expired", req.url));
  }
}
