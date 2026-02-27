"use client";

import { useAudio, Album } from "@/context/AudioContext";
import { Play, Disc } from "lucide-react";

interface AlbumCardProps {
    album: Album;
    onAlbumClick: (album: Album) => void;
    isActiveAlbum: boolean;
}

function AlbumCard({ album, onAlbumClick, isActiveAlbum }: AlbumCardProps) {
    const { currentTrack, state } = useAudio();
    const hasActivePlaying = state.isPlaying && album.tracks.some((t) => t.id === currentTrack?.id);

    return (
        <div
            onClick={() => onAlbumClick(album)}
            style={{
                cursor: "pointer",
                position: "relative",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.6)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
        >
            {/* Cover art */}
            <div
                style={{
                    position: "relative",
                    paddingBottom: "100%",
                    overflow: "hidden",
                    background: "var(--surface-2)",
                    border: isActiveAlbum
                        ? "1px solid rgba(201,168,76,0.5)"
                        : "1px solid rgba(255,255,255,0.04)",
                }}
            >
                {album.coverArt ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={album.coverArt}
                        alt={album.title}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, var(--surface-2), var(--surface-3))",
                        }}
                    >
                        <Disc size={40} color="rgba(201,168,76,0.2)" />
                    </div>
                )}

                {/* Play overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.2s ease",
                    }}
                    className="album-overlay"
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 0 20px rgba(201,168,76,0.4)",
                        }}
                    >
                        <Play size={18} fill="var(--black)" color="var(--black)" />
                    </div>
                </div>

                {/* Playing indicator */}
                {hasActivePlaying && (
                    <div
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            display: "flex",
                            gap: 2,
                            alignItems: "flex-end",
                            height: 16,
                            background: "rgba(0,0,0,0.7)",
                            padding: "4px 6px",
                            borderRadius: "2px",
                        }}
                    >
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: 3,
                                    borderRadius: 1,
                                    background: "var(--gold)",
                                    animation: `noise-1 ${0.6 + i * 0.15}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.1}s`,
                                    height: "100%",
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Active border glow */}
                {isActiveAlbum && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            border: "2px solid rgba(201,168,76,0.6)",
                            boxShadow: "inset 0 0 20px rgba(201,168,76,0.1)",
                            pointerEvents: "none",
                        }}
                    />
                )}
            </div>

            {/* Info */}
            <div style={{ padding: "0.6rem 0.25rem" }}>
                <p
                    style={{
                        color: isActiveAlbum ? "var(--gold)" : "var(--text-primary)",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        transition: "color 0.2s",
                    }}
                >
                    {album.title}
                </p>
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.05em",
                        marginTop: "0.15rem",
                    }}
                >
                    {album.year} · {album.tracks.length} tracks
                </p>
            </div>

            <style>{`
        div:hover .album-overlay {
          opacity: 1 !important;
        }
      `}</style>
        </div>
    );
}

interface AlbumGridProps {
    onAlbumSelect: (album: Album) => void;
}

export default function AlbumGrid({ onAlbumSelect }: AlbumGridProps) {
    const { state } = useAudio();
    const { albums, activeAlbumId } = state;

    if (albums.length === 0) return null;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "1rem",
                padding: "0.5rem 0",
            }}
        >
            {albums.map((album) => (
                <AlbumCard
                    key={album.id}
                    album={album}
                    onAlbumClick={onAlbumSelect}
                    isActiveAlbum={activeAlbumId === album.id}
                />
            ))}
        </div>
    );
}
