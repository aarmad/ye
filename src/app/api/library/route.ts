import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Absolute path to the discography folder
const DISCOGRAPHY_PATH = path.join(
    process.cwd(),
    "..",
    "Kanye West - Discography 1999-2021"
);

// Parse album folder name: "(2004) Kanye West - The College Dropout [16Bit-44.1kHz]"
function parseAlbumFolder(folderName: string) {
    const yearMatch = folderName.match(/^\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : "Unknown";

    // Remove year prefix and quality suffix
    let name = folderName
        .replace(/^\(\d{4}\)\s*/, "")
        .replace(/\s*\[\d+Bit-[\d.]+kHz\]\s*$/, "")
        .trim();

    // Remove "Kanye West - " prefix
    const artistSep = name.indexOf(" - ");
    let artist = "Kanye West";
    let albumTitle = name;
    if (artistSep !== -1) {
        artist = name.substring(0, artistSep).trim();
        albumTitle = name.substring(artistSep + 3).trim();
    }

    return { year, artist, albumTitle };
}

// Parse track filename: "02. We Don't Care.flac"
function parseTrackFile(filename: string) {
    const nameWithoutExt = filename.replace(/\.(flac|mp3|wav|ogg|m4a|aac)$/i, "");

    // Extract track number
    const numMatch = nameWithoutExt.match(/^(\d+)[.\s]+/);
    const trackNumber = numMatch ? parseInt(numMatch[1]) : 0;

    // Extract title (remove track number prefix)
    const title = nameWithoutExt.replace(/^\d+[.\s]+/, "").trim();

    return { trackNumber, title };
}

export async function GET() {
    try {
        if (!fs.existsSync(DISCOGRAPHY_PATH)) {
            return NextResponse.json(
                { error: "Discography folder not found", path: DISCOGRAPHY_PATH },
                { status: 404 }
            );
        }

        const albums: {
            id: string;
            year: string;
            artist: string;
            title: string;
            folderName: string;
            coverArt: string | null;
            tracks: {
                id: string;
                trackNumber: number;
                title: string;
                artist: string;
                album: string;
                year: string;
                filename: string;
                albumFolder: string;
                url: string;
                coverArt: string | null;
            }[];
        }[] = [];

        const entries = fs.readdirSync(DISCOGRAPHY_PATH, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const folderName = entry.name;
            const folderPath = path.join(DISCOGRAPHY_PATH, folderName);
            const { year, artist, albumTitle } = parseAlbumFolder(folderName);

            // Check for cover art
            const coverFiles = ["cover.jpg", "cover.png", "Cover.jpg", "Cover.png", "folder.jpg"];
            let coverArtUrl: string | null = null;
            for (const cf of coverFiles) {
                if (fs.existsSync(path.join(folderPath, cf))) {
                    coverArtUrl = `/api/cover?album=${encodeURIComponent(folderName)}&file=${encodeURIComponent(cf)}`;
                    break;
                }
            }

            // Scan audio files
            const albumFiles = fs.readdirSync(folderPath);
            const audioFiles = albumFiles.filter((f) =>
                /\.(flac|mp3|wav|ogg|m4a|aac)$/i.test(f)
            );

            const tracks = audioFiles
                .map((filename) => {
                    const { trackNumber, title } = parseTrackFile(filename);
                    const albumId = Buffer.from(folderName).toString("base64");
                    const trackId = `${albumId}-${trackNumber}-${Buffer.from(title).toString("base64").slice(0, 32)}`;

                    return {
                        id: trackId,
                        trackNumber,
                        title,
                        artist,
                        album: albumTitle,
                        year,
                        filename,
                        albumFolder: folderName,
                        url: `/api/audio?album=${encodeURIComponent(folderName)}&file=${encodeURIComponent(filename)}`,
                        coverArt: coverArtUrl,
                    };
                })
                .sort((a, b) => a.trackNumber - b.trackNumber);

            if (tracks.length > 0) {
                albums.push({
                    id: Buffer.from(folderName).toString("base64"),
                    year,
                    artist,
                    title: albumTitle,
                    folderName,
                    coverArt: coverArtUrl,
                    tracks,
                });
            }
        }

        // Sort albums by year
        albums.sort((a, b) => parseInt(a.year) - parseInt(b.year));

        return NextResponse.json({ albums, totalTracks: albums.reduce((sum, a) => sum + a.tracks.length, 0) });
    } catch (error) {
        console.error("Library scan error:", error);
        return NextResponse.json(
            { error: "Failed to scan library", details: String(error) },
            { status: 500 }
        );
    }
}
