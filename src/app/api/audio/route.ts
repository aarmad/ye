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
        return new NextResponse("Missing album or file parameter", { status: 400 });
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

    if (!fs.existsSync(filePath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Determine content type
    const ext = path.extname(file).toLowerCase();
    const contentTypeMap: Record<string, string> = {
        ".flac": "audio/flac",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".m4a": "audio/mp4",
        ".aac": "audio/aac",
    };
    const contentType = contentTypeMap[ext] || "audio/octet-stream";

    // Handle range requests (needed for audio seeking)
    const range = request.headers.get("range");

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const fileStream = fs.createReadStream(filePath, { start, end });

        const headers = new Headers({
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize.toString(),
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
        });

        // Convert NodeJS stream to Web ReadableStream
        const readable = new ReadableStream({
            start(controller) {
                fileStream.on("data", (chunk) => controller.enqueue(chunk));
                fileStream.on("end", () => controller.close());
                fileStream.on("error", (err) => controller.error(err));
            },
            cancel() {
                fileStream.destroy();
            },
        });

        return new NextResponse(readable, { status: 206, headers });
    }

    // Full file response
    const fileStream = fs.createReadStream(filePath);
    const headers = new Headers({
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
    });

    const readable = new ReadableStream({
        start(controller) {
            fileStream.on("data", (chunk) => controller.enqueue(chunk));
            fileStream.on("end", () => controller.close());
            fileStream.on("error", (err) => controller.error(err));
        },
        cancel() {
            fileStream.destroy();
        },
    });

    return new NextResponse(readable, { status: 200, headers });
}
