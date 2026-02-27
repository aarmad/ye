"use client";

import { useRef, useState, useCallback } from "react";
import { useAudio } from "@/context/AudioContext";
import { Upload, Music } from "lucide-react";

export default function FileUploader() {
    const { loadFiles, state } = useAudio();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            if (!files || files.length === 0) return;
            loadFiles(files);
        },
        [loadFiles]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles]
    );

    return (
        <div className="space-y-3">
            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer transition-all duration-300"
                style={{
                    border: `1px dashed ${isDragging ? "rgba(201, 168, 76, 0.8)" : "rgba(201, 168, 76, 0.25)"}`,
                    background: isDragging
                        ? "rgba(201, 168, 76, 0.08)"
                        : "rgba(20, 20, 20, 0.6)",
                    padding: "2rem 1.5rem",
                    borderRadius: "2px",
                    boxShadow: isDragging ? "0 0 30px rgba(201, 168, 76, 0.15)" : "none",
                }}
            >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "rgba(201, 168, 76, 0.1)",
                            border: "1px solid rgba(201, 168, 76, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Upload size={20} color="rgba(201, 168, 76, 0.8)" />
                    </div>
                    <div>
                        <p
                            style={{
                                color: "var(--text-primary)",
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                letterSpacing: "0.05em",
                            }}
                        >
                            {state.isLoading ? "LOADING..." : "DROP FILES HERE"}
                        </p>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.7rem",
                                letterSpacing: "0.08em",
                                marginTop: "0.25rem",
                            }}
                        >
                            MP3 / FLAC / WAV / OGG / M4A
                        </p>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".mp3,.flac,.wav,.ogg,.m4a,.aac,audio/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {/* Folder button */}
            <button
                onClick={() => folderInputRef.current?.click()}
                className="btn-outline-gold w-full flex items-center justify-center gap-2"
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
                <Music size={14} />
                <span>LOAD FOLDER</span>
            </button>
            <input
                ref={folderInputRef}
                type="file"
                multiple
                // @ts-ignore
                webkitdirectory=""
                accept=".mp3,.flac,.wav,.ogg,.m4a,.aac,audio/*"
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Stats */}
            {state.tracks.length > 0 && (
                <div
                    style={{
                        textAlign: "center",
                        color: "var(--text-secondary)",
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                    }}
                >
                    {state.tracks.length} track{state.tracks.length !== 1 ? "s" : ""} loaded
                </div>
            )}
        </div>
    );
}
