"use client";

import { useState } from "react";
import { useAudio, Track } from "@/context/AudioContext";
import {
    Search,
    MoreVertical,
    Play,
    Plus,
    Check,
} from "lucide-react";

function TrackNumber({
    index,
    isActive,
    isPlaying,
}: {
    index: number;
    isActive: boolean;
    isPlaying: boolean;
}) {
    if (isActive && isPlaying) {
        return (
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
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
        );
    }
    return (
        <span
            style={{
                color: isActive ? "var(--gold)" : "var(--text-muted)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.7rem",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.05em",
                minWidth: 20,
                textAlign: "right",
            }}
        >
            {String(index + 1).padStart(2, "0")}
        </span>
    );
}

export default function TrackList() {
    const { state, dispatch, displayedTracks, currentTrack, playTrack, togglePlay, formatTime } =
        useAudio();
    const [contextMenu, setContextMenu] = useState<{
        track: Track;
        x: number;
        y: number;
    } | null>(null);
    const [addedTo, setAddedTo] = useState<string | null>(null);

    const handleTrackClick = (track: Track, indexInDisplayed: number) => {
        const globalIndex = state.tracks.findIndex((t) => t.id === track.id);
        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            playTrack(globalIndex);
        }
    };

    const handleContextMenu = (
        e: React.MouseEvent,
        track: Track
    ) => {
        e.preventDefault();
        setContextMenu({ track, x: e.clientX, y: e.clientY });
    };

    const addToPlaylist = (playlistId: string, trackId: string) => {
        dispatch({ type: "ADD_TO_PLAYLIST", payload: { playlistId, trackId } });
        setAddedTo(playlistId);
        setTimeout(() => {
            setAddedTo(null);
            setContextMenu(null);
        }, 800);
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* Search bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0 0 0.75rem 0",
                    borderBottom: "1px solid var(--border)",
                    marginBottom: "0.5rem",
                }}
            >
                <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                    type="search"
                    placeholder="SEARCH TRACKS..."
                    value={state.searchQuery}
                    onChange={(e) =>
                        dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value })
                    }
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-secondary)",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        outline: "none",
                        width: "100%",
                        padding: 0,
                    }}
                />
            </div>

            {/* Column header */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr auto",
                    gap: "0.75rem",
                    padding: "0 0.5rem 0.5rem",
                    borderBottom: "1px solid rgba(201,168,76,0.08)",
                    marginBottom: "0.25rem",
                }}
            >
                <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>#</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>TITLE</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>TIME</span>
            </div>

            {/* Track list */}
            <div className="scrollable" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {displayedTracks.length === 0 ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            gap: "1rem",
                            padding: "3rem 0",
                        }}
                    >
                        <div
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                border: "1px dashed rgba(201,168,76,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Play size={20} color="rgba(201,168,76,0.3)" />
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <p
                                style={{
                                    color: "var(--text-secondary)",
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "0.8rem",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                }}
                            >
                                {state.searchQuery ? "No results" : "No tracks loaded"}
                            </p>
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.7rem",
                                    marginTop: "0.35rem",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                {state.searchQuery
                                    ? "Try a different search"
                                    : "Drop your music files to start"}
                            </p>
                        </div>
                    </div>
                ) : (
                    displayedTracks.map((track, idx) => {
                        const isActive = currentTrack?.id === track.id;
                        return (
                            <div
                                key={track.id}
                                className={`track-item ${isActive ? "active" : ""}`}
                                onClick={() => handleTrackClick(track, idx)}
                                onContextMenu={(e) => handleContextMenu(e, track)}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "24px 1fr auto",
                                    gap: "0.75rem",
                                    padding: "0.7rem 0.5rem",
                                    cursor: "pointer",
                                    alignItems: "center",
                                    borderRadius: "2px",
                                }}
                            >
                                {/* Number / playing indicator */}
                                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                                    <TrackNumber
                                        index={idx}
                                        isActive={isActive}
                                        isPlaying={state.isPlaying}
                                    />
                                </div>

                                {/* Title & Artist */}
                                <div style={{ overflow: "hidden" }}>
                                    <p
                                        style={{
                                            color: isActive ? "var(--gold-light)" : "var(--text-primary)",
                                            fontFamily: "'Space Grotesk', sans-serif",
                                            fontSize: "0.82rem",
                                            fontWeight: isActive ? 600 : 400,
                                            letterSpacing: "0.02em",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            transition: "color 0.2s",
                                        }}
                                    >
                                        {track.title}
                                    </p>
                                    <p
                                        style={{
                                            color: isActive ? "rgba(201,168,76,0.6)" : "var(--text-muted)",
                                            fontSize: "0.7rem",
                                            letterSpacing: "0.03em",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            transition: "color 0.2s",
                                        }}
                                    >
                                        {track.artist}
                                        {track.album && track.album !== "Unknown Album" ? ` · ${track.album}` : ""}
                                    </p>
                                </div>

                                {/* Duration */}
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "0.7rem",
                                            fontVariantNumeric: "tabular-nums",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        {track.duration > 0 ? formatTime(track.duration) : "--:--"}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleContextMenu(e as any, track);
                                        }}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            color: "var(--text-muted)",
                                            cursor: "pointer",
                                            opacity: 0,
                                            padding: "0 0.15rem",
                                            transition: "opacity 0.2s",
                                        }}
                                        className="more-btn"
                                    >
                                        <MoreVertical size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Context menu */}
            {contextMenu && (
                <>
                    <div
                        style={{ position: "fixed", inset: 0, zIndex: 50 }}
                        onClick={() => setContextMenu(null)}
                    />
                    <div
                        style={{
                            position: "fixed",
                            left: Math.min(contextMenu.x, window.innerWidth - 200),
                            top: Math.min(contextMenu.y, window.innerHeight - 200),
                            zIndex: 51,
                            background: "rgba(20, 20, 20, 0.97)",
                            border: "1px solid rgba(201, 168, 76, 0.2)",
                            backdropFilter: "blur(20px)",
                            minWidth: 180,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
                            padding: "0.5rem 0",
                        }}
                    >
                        <div
                            style={{
                                padding: "0.5rem 1rem",
                                borderBottom: "1px solid rgba(201,168,76,0.1)",
                                marginBottom: "0.25rem",
                            }}
                        >
                            <p
                                style={{
                                    color: "var(--text-primary)",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    letterSpacing: "0.02em",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 160,
                                }}
                            >
                                {contextMenu.track.title}
                            </p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                                {contextMenu.track.artist}
                            </p>
                        </div>

                        {state.playlists.length > 0 ? (
                            <>
                                <p
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "0.6rem",
                                        letterSpacing: "0.15em",
                                        textTransform: "uppercase",
                                        padding: "0.35rem 1rem",
                                    }}
                                >
                                    Add to playlist
                                </p>
                                {state.playlists.map((pl) => {
                                    const isAdded = pl.trackIds.includes(contextMenu.track.id);
                                    const justAdded = addedTo === pl.id;
                                    return (
                                        <button
                                            key={pl.id}
                                            onClick={() => addToPlaylist(pl.id, contextMenu.track.id)}
                                            disabled={isAdded}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.6rem",
                                                width: "100%",
                                                background: "transparent",
                                                border: "none",
                                                cursor: isAdded ? "default" : "pointer",
                                                padding: "0.5rem 1rem",
                                                transition: "background 0.2s",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isAdded) (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.07)";
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                            }}
                                        >
                                            {isAdded ? (
                                                <Check size={12} color="var(--gold)" />
                                            ) : (
                                                <Plus size={12} color="var(--text-muted)" />
                                            )}
                                            <span
                                                style={{
                                                    color: isAdded ? "var(--gold)" : "var(--text-secondary)",
                                                    fontSize: "0.78rem",
                                                    letterSpacing: "0.02em",
                                                }}
                                            >
                                                {pl.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </>
                        ) : (
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.72rem",
                                    padding: "0.5rem 1rem",
                                    letterSpacing: "0.05em",
                                }}
                            >
                                Create a playlist first
                            </p>
                        )}
                    </div>
                </>
            )}

            {/* CSS for hover on more button */}
            <style>{`
        .track-item:hover .more-btn {
          opacity: 1 !important;
        }
      `}</style>
        </div>
    );
}
