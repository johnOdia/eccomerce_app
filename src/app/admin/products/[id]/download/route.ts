export async function GET(
  req: any,
  { params: { id } }: { params: { id: string } }
) {
  const db = require("@/db/db");
  const { notFound } = require("next/navigation");
  const { NextRequest, NextResponse } = require("next/server");
  const fs = require("fs/promises");

  const product = await db.product.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  });

  if (product == null) return notFound();

  const { size } = await fs.stat(product.filePath);
  const file = await fs.readFile(product.filePath);
  const extension = product.filePath.split(".").pop();

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  });
}
