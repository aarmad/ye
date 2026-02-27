import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DISCOGRAPHY_PATH = path.join(
    process.cwd(),
    "..",
    "Kanye West - Discography 1999-2021"
);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const album = searchParams.get("album");
    const file = searchParams.get("file");

    if (!album || !file) {
        return new NextResponse("Missing parameters", { status: 400 });
    }

    // Security: prevent path traversal
    const albumPath = path.resolve(DISCOGRAPHY_PATH, album);
    if (!albumPath.startsWith(path.resolve(DISCOGRAPHY_PATH))) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const filePath = path.resolve(albumPath, file);
    if (!filePath.startsWith(albumPath)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // Also check root-level cover (for the main Cover.jpg)
    const rootFilePath = path.resolve(DISCOGRAPHY_PATH, file);

    const resolvedPath = fs.existsSync(filePath)
        ? filePath
        : fs.existsSync(rootFilePath)
            ? rootFilePath
            : null;

    if (!resolvedPath) {
        return new NextResponse("Cover not found", { status: 404 });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    };
    const contentType = contentTypeMap[ext] || "image/jpeg";

    const fileBuffer = fs.readFileSync(resolvedPath);

    return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400",
            "Content-Length": fileBuffer.length.toString(),
        },
    });
}
