"use client";

import { useState, useEffect } from "react";
import { useAudio, Album } from "@/context/AudioContext";
import VinylDisplay from "./VinylDisplay";
import PlayerControls from "./PlayerControls";
import TrackList from "./TrackList";
import PlaylistManager from "./PlaylistManager";
import FileUploader from "./FileUploader";
import AlbumGrid from "./AlbumGrid";
import { ListMusic, Upload, Menu, Disc, ArrowLeft, Loader2 } from "lucide-react";

// --- Background ambient ---
function AmbientBackground() {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{
                position: "absolute", top: "-15%", right: "-10%", width: "50vw", height: "50vw",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", bottom: "-20%", left: "-10%", width: "40vw", height: "40vw",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `linear-gradient(rgba(201,168,76,0.02) 1px, transparent 1px),linear-gradient(90deg, rgba(201,168,76,0.02) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
            }} />
        </div>
    );
}

function SidebarTab({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            background: active ? "rgba(201,168,76,0.1)" : "transparent",
            border: "none",
            borderLeft: `2px solid ${active ? "var(--gold)" : "transparent"}`,
            color: active ? "var(--gold)" : "var(--text-muted)",
            cursor: "pointer", transition: "all 0.2s", width: "100%", textAlign: "left",
            fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.7rem",
            fontWeight: active ? 600 : 400, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
            {icon}{label}
        </button>
    );
}

type RightView = "library" | "albums" | "album-tracks";

export default function MainLayout() {
    const { state, dispatch, loadLibrary, playTrack } = useAudio();
    const [sidebarTab, setSidebarTab] = useState<"playlists" | "upload">("upload");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [rightView, setRightView] = useState<RightView>("albums");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Auto-load the discography on mount
        loadLibrary();
    }, []);

    const handleAlbumSelect = (album: Album) => {
        dispatch({ type: "SET_ACTIVE_ALBUM", payload: album.id });
        // Filter to show only this album's tracks
        dispatch({ type: "SET_ACTIVE_PLAYLIST", payload: null });
        dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
        setRightView("album-tracks");
    };

    const handlePlayAlbum = (album: Album) => {
        // Find the first track index in global tracks list
        if (album.tracks.length === 0) return;
        const firstTrackId = album.tracks[0].id;
        const globalIndex = state.tracks.findIndex((t) => t.id === firstTrackId);
        if (globalIndex >= 0) playTrack(globalIndex);
    };

    // Which tracks to show in library view
    const activeAlbum = state.activeAlbumId
        ? state.albums.find((a) => a.id === state.activeAlbumId)
        : null;

    const activePlaylistName = state.activePlaylistId
        ? state.playlists.find((p) => p.id === state.activePlaylistId)?.name ?? "PLAYLIST"
        : null;

    // Page title logic
    let pageTitle = "LIBRARY";
    let pageSubtitle = "HIP-HOP · RAP · GOSPEL · EXPERIMENTAL";
    if (rightView === "albums") {
        pageTitle = "DISCOGRAPHY";
        pageSubtitle = `${state.albums.length} ALBUMS · ${state.tracks.length} TRACKS`;
    } else if (rightView === "album-tracks" && activeAlbum) {
        pageTitle = activeAlbum.title.toUpperCase();
        pageSubtitle = `${activeAlbum.year} · ${activeAlbum.tracks.length} TRACKS`;
    } else if (activePlaylistName) {
        pageTitle = activePlaylistName.toUpperCase();
        pageSubtitle = `${state.playlists.find((p) => p.id === state.activePlaylistId)?.trackIds.length ?? 0} TRACKS`;
    }

    if (!mounted) return null;

    return (
        <div style={{
            position: "relative", width: "100vw", height: "100vh",
            display: "flex", flexDirection: "column",
            background: "var(--black)", overflow: "hidden",
        }}>
            <AmbientBackground />

            {/* ===== HEADER ===== */}
            <header style={{
                position: "relative", zIndex: 10,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "1.25rem 2rem",
                borderBottom: "1px solid rgba(201,168,76,0.08)",
                background: "rgba(8,8,8,0.8)", backdropFilter: "blur(20px)", flexShrink: 0,
            }}>
                {/* Left */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button onClick={() => setSidebarOpen((v) => !v)} style={{
                        background: "transparent", border: "none", color: "var(--text-muted)",
                        cursor: "pointer", display: "flex", padding: "0.25rem", transition: "color 0.2s",
                    }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--gold)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
                    >
                        <Menu size={18} />
                    </button>
                    <div>
                        <h1 style={{
                            fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.2em",
                            background: "linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1,
                        }}>YE</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase" }}>
                            MUSIC PLAYER
                        </p>
                    </div>
                </div>

                {/* Center: loading indicator or stats */}
                <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textAlign: "center", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {state.isLoading && <Loader2 size={12} color="var(--gold)" style={{ animation: "spin-vinyl 1s linear infinite" }} />}
                    <p style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase" }}>
                        {state.isLoading
                            ? "LOADING DISCOGRAPHY..."
                            : state.tracks.length > 0
                                ? `${state.albums.length} ALBUMS · ${state.tracks.length} TRACKS`
                                : "THE LIFE OF SOUND"}
                    </p>
                </div>

                {/* Right: nav */}
                <nav style={{ display: "flex", gap: "1.5rem" }}>
                    {[
                        { label: "DISCOGRAPHY", view: "albums" as RightView },
                        { label: "LIBRARY", view: "library" as RightView },
                    ].map(({ label, view }) => (
                        <button key={label} onClick={() => {
                            setRightView(view);
                            if (view === "library") {
                                dispatch({ type: "SET_ACTIVE_ALBUM", payload: null });
                                dispatch({ type: "SET_ACTIVE_PLAYLIST", payload: null });
                            }
                        }} style={{
                            background: "transparent", border: "none",
                            color: rightView === view ? "var(--gold)" : "var(--text-muted)",
                            fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.65rem",
                            letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer",
                            transition: "color 0.2s", padding: 0,
                            borderBottom: rightView === view ? "1px solid var(--gold)" : "1px solid transparent",
                            paddingBottom: "2px",
                        }}>
                            {label}
                        </button>
                    ))}
                    <button onClick={() => { setSidebarTab("playlists"); setSidebarOpen(true); }} style={{
                        background: "transparent", border: "none", color: "var(--text-muted)",
                        fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.65rem",
                        letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer",
                        transition: "color 0.2s", padding: 0,
                    }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--gold)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
                    >
                        PLAYLISTS
                    </button>
                </nav>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative", zIndex: 1 }}>

                {/* ====== SIDEBAR ====== */}
                <aside style={{
                    width: sidebarOpen ? "240px" : "0",
                    flexShrink: 0,
                    background: "rgba(12, 12, 12, 0.9)",
                    borderRight: sidebarOpen ? "1px solid rgba(201,168,76,0.08)" : "none",
                    display: "flex", flexDirection: "column",
                    overflow: "hidden", transition: "width 0.3s ease",
                }}>
                    {sidebarOpen && (<>
                        <div style={{ borderBottom: "1px solid rgba(201,168,76,0.08)", padding: "0.5rem 0" }}>
                            <SidebarTab label="Upload" icon={<Upload size={13} />} active={sidebarTab === "upload"} onClick={() => setSidebarTab("upload")} />
                            <SidebarTab label="Playlists" icon={<ListMusic size={13} />} active={sidebarTab === "playlists"} onClick={() => setSidebarTab("playlists")} />
                        </div>
                        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                            {sidebarTab === "upload" && <FileUploader />}
                            {sidebarTab === "playlists" && <PlaylistManager />}
                        </div>
                        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid rgba(201,168,76,0.06)" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center" }}>
                                YE PLAYER · 2025
                            </p>
                        </div>
                    </>)}
                </aside>

                {/* ====== CENTER: VINYL + CONTROLS ====== */}
                <div style={{
                    flex: "0 0 320px", display: "flex", flexDirection: "column",
                    borderRight: "1px solid rgba(201,168,76,0.08)",
                    background: "rgba(10, 10, 10, 0.6)",
                    padding: "1.25rem", gap: "1.25rem", overflow: "hidden",
                }}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <VinylDisplay />
                    </div>
                    <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)", flexShrink: 0 }} />
                    <div style={{ flexShrink: 0 }}>
                        <PlayerControls />
                    </div>
                </div>

                {/* ====== RIGHT PANEL ====== */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{
                        padding: "1rem 2rem 0.75rem",
                        borderBottom: "1px solid rgba(201,168,76,0.06)",
                        flexShrink: 0,
                    }}>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
                            {/* Back button */}
                            {(rightView === "album-tracks") && (
                                <button onClick={() => { setRightView("albums"); dispatch({ type: "SET_ACTIVE_ALBUM", payload: null }); }} style={{
                                    background: "transparent", border: "1px solid rgba(201,168,76,0.2)",
                                    color: "var(--text-muted)", fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase",
                                    cursor: "pointer", padding: "0.35rem 0.75rem", transition: "all 0.2s",
                                    display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem",
                                    flexShrink: 0,
                                }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--gold)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.5)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.2)"; }}
                                >
                                    <ArrowLeft size={12} /> ALBUMS
                                </button>
                            )}

                            {/* Album cover small */}
                            {rightView === "album-tracks" && activeAlbum?.coverArt && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={activeAlbum.coverArt} alt={activeAlbum.title}
                                    style={{ width: 52, height: 52, objectFit: "cover", border: "1px solid rgba(201,168,76,0.2)", flexShrink: 0 }}
                                />
                            )}

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{
                                    fontFamily: "'Bebas Neue', sans-serif",
                                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                                    letterSpacing: "0.05em",
                                    background: "linear-gradient(135deg, var(--text-primary) 0%, rgba(245,240,232,0.4) 100%)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                                    lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                }}>
                                    {pageTitle}
                                </h2>
                                <p style={{ color: "var(--gold)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "0.25rem" }}>
                                    {pageSubtitle}
                                </p>
                            </div>

                            {/* Play all button for album view */}
                            {rightView === "album-tracks" && activeAlbum && (
                                <button onClick={() => handlePlayAlbum(activeAlbum)} style={{
                                    background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)",
                                    border: "none", color: "var(--black)", fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em",
                                    textTransform: "uppercase", cursor: "pointer", padding: "0.5rem 1.25rem",
                                    transition: "all 0.2s", flexShrink: 0, marginBottom: "0.25rem",
                                    display: "flex", alignItems: "center", gap: "0.4rem",
                                }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(201,168,76,0.4)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                                >
                                    ▶ PLAY ALBUM
                                </button>
                            )}

                            {/* Back to library button from playlist view */}
                            {rightView === "library" && state.activePlaylistId && (
                                <button onClick={() => dispatch({ type: "SET_ACTIVE_PLAYLIST", payload: null })} style={{
                                    background: "transparent", border: "1px solid rgba(201,168,76,0.2)",
                                    color: "var(--text-muted)", fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase",
                                    cursor: "pointer", padding: "0.35rem 0.75rem", transition: "all 0.2s", marginBottom: "0.25rem",
                                }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                                >
                                    ← ALL TRACKS
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflow: "hidden auto", padding: "0.75rem 2rem 1.5rem" }}>
                        {rightView === "albums" && state.isLoading ? (
                            /* Loading state */
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "1.5rem" }}>
                                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 40 }}>
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <div key={i} style={{
                                            width: 6, borderRadius: 2, background: "var(--gold)",
                                            animation: `noise-1 ${0.5 + i * 0.1}s ease-in-out infinite`,
                                            animationDelay: `${i * 0.08}s`, height: "100%",
                                        }} />
                                    ))}
                                </div>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                                    LOADING DISCOGRAPHY...
                                </p>
                            </div>
                        ) : rightView === "albums" ? (
                            /* Album grid */
                            state.albums.length > 0 ? (
                                <AlbumGrid onAlbumSelect={handleAlbumSelect} />
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "1rem" }}>
                                    <Disc size={48} color="rgba(201,168,76,0.2)" />
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                        No albums found
                                    </p>
                                </div>
                            )
                        ) : rightView === "album-tracks" && activeAlbum ? (
                            /* Album tracklist — filter the TrackList to show only album tracks */
                            <div>
                                {/* Album tracks directly rendered */}
                                <div style={{ borderBottom: "1px solid rgba(201,168,76,0.06)", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: "0.75rem", padding: "0 0.5rem 0.5rem" }}>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>#</span>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>TITLE</span>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>TIME</span>
                                    </div>
                                </div>
                                <AlbumTrackList album={activeAlbum} />
                            </div>
                        ) : (
                            /* Library view: full flat tracklist */
                            <TrackList />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Inline album tracklist component
function AlbumTrackList({ album }: { album: Album }) {
    const { state, currentTrack, playTrack, togglePlay, formatTime } = useAudio();

    return (
        <div>
            {album.tracks.map((track, idx) => {
                const isActive = currentTrack?.id === track.id;
                const globalIndex = state.tracks.findIndex((t) => t.id === track.id);

                return (
                    <div
                        key={track.id}
                        onClick={() => {
                            if (isActive) togglePlay();
                            else if (globalIndex >= 0) playTrack(globalIndex);
                        }}
                        className={`track-item ${isActive ? "active" : ""}`}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "24px 1fr auto",
                            gap: "0.75rem", padding: "0.7rem 0.5rem",
                            cursor: "pointer", alignItems: "center", borderRadius: "2px",
                        }}
                    >
                        {/* Number */}
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                            {isActive && state.isPlaying ? (
                                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} style={{
                                            width: 3, borderRadius: 1, background: "var(--gold)",
                                            animation: `noise-1 ${0.6 + i * 0.15}s ease-in-out infinite`,
                                            animationDelay: `${i * 0.1}s`, height: "100%",
                                        }} />
                                    ))}
                                </div>
                            ) : (
                                <span style={{ color: isActive ? "var(--gold)" : "var(--text-muted)", fontSize: "0.7rem", minWidth: 20, textAlign: "right" }}>
                                    {String(track.trackNumber ?? idx + 1).padStart(2, "0")}
                                </span>
                            )}
                        </div>
                        {/* Title */}
                        <div style={{ overflow: "hidden" }}>
                            <p style={{
                                color: isActive ? "var(--gold-light)" : "var(--text-primary)",
                                fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem",
                                fontWeight: isActive ? 600 : 400, letterSpacing: "0.02em",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.2s",
                            }}>{track.title}</p>
                            <p style={{ color: isActive ? "rgba(201,168,76,0.6)" : "var(--text-muted)", fontSize: "0.7rem" }}>
                                {track.artist}
                            </p>
                        </div>
                        {/* Duration */}
                        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontVariantNumeric: "tabular-nums" }}>
                            {track.duration > 0 ? formatTime(track.duration) : "--:--"}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
