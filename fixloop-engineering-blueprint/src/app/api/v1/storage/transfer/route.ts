import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { PrivateStorage } from "@/lib/storage/private-storage";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing transfer token" }, { status: 401 });
  }

  try {
    const payload = await PrivateStorage.verifyTransferToken(token);
    if (payload.operation !== "DOWNLOAD") {
      return NextResponse.json({ error: "Invalid token operation" }, { status: 403 });
    }

    const buffer = await PrivateStorage.readBytes(payload.objectKey);
    const fileName = path.basename(payload.objectKey);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache, no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Storage download error:", err);
    return NextResponse.json({ error: "Unauthorized or expired token" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing transfer token" }, { status: 401 });
  }

  try {
    const payload = await PrivateStorage.verifyTransferToken(token);
    if (payload.operation !== "UPLOAD") {
      return NextResponse.json({ error: "Invalid token operation" }, { status: 403 });
    }

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await PrivateStorage.writeBytes(payload.objectKey, buffer);

    return NextResponse.json({
      success: true,
      size: buffer.length,
      objectKey: payload.objectKey,
    });
  } catch (err) {
    console.error("Storage upload error:", err);
    return NextResponse.json({ error: "Upload failed or unauthorized" }, { status: 401 });
  }
}
