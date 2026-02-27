"use client";

import { useState, useCallback } from "react";
import { useAudio } from "@/context/AudioContext";
import { Plus, ListMusic, Trash2, X, Check } from "lucide-react";

export default function PlaylistManager() {
    const { state, dispatch, currentTrack } = useAudio();
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);

    const createPlaylist = useCallback(() => {
        const name = newPlaylistName.trim();
        if (!name) return;
        dispatch({ type: "CREATE_PLAYLIST", payload: name });
        setNewPlaylistName("");
        setShowCreateForm(false);
    }, [newPlaylistName, dispatch]);

    const addCurrentToPlaylist = useCallback(
        (playlistId: string) => {
            if (!currentTrack) return;
            dispatch({
                type: "ADD_TO_PLAYLIST",
                payload: { playlistId, trackId: currentTrack.id },
            });
            setAddingToPlaylist(playlistId);
            setTimeout(() => setAddingToPlaylist(null), 1500);
        },
        [currentTrack, dispatch]
    );

    const deletePlaylist = useCallback(
        (playlistId: string) => {
            dispatch({ type: "DELETE_PLAYLIST", payload: playlistId });
        },
        [dispatch]
    );

    const selectPlaylist = useCallback(
        (playlistId: string | null) => {
            dispatch({ type: "SET_ACTIVE_PLAYLIST", payload: playlistId });
        },
        [dispatch]
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <span
                    style={{
                        color: "var(--gold)",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                    }}
                >
                    PLAYLISTS
                </span>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{
                        background: "rgba(201, 168, 76, 0.1)",
                        border: "1px solid rgba(201, 168, 76, 0.3)",
                        color: "var(--gold)",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                >
                    {showCreateForm ? <X size={12} /> : <Plus size={12} />}
                </button>
            </div>

            {/* Create form */}
            {showCreateForm && (
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        animation: "fade-up 0.3s ease",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Playlist name..."
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
                        style={{
                            flex: 1,
                            background: "rgba(20, 20, 20, 0.8)",
                            border: "1px solid rgba(201, 168, 76, 0.3)",
                            color: "var(--text-primary)",
                            padding: "0.4rem 0.75rem",
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: "0.8rem",
                            outline: "none",
                        }}
                        autoFocus
                    />
                    <button
                        onClick={createPlaylist}
                        style={{
                            background: "rgba(201, 168, 76, 0.2)",
                            border: "1px solid rgba(201, 168, 76, 0.4)",
                            color: "var(--gold)",
                            width: 34,
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <Check size={14} />
                    </button>
                </div>
            )}

            {/* All tracks option */}
            <button
                onClick={() => selectPlaylist(null)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    background:
                        state.activePlaylistId === null
                            ? "rgba(201, 168, 76, 0.1)"
                            : "transparent",
                    border: `1px solid ${state.activePlaylistId === null
                            ? "rgba(201, 168, 76, 0.3)"
                            : "transparent"
                        }`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "left",
                }}
            >
                <ListMusic
                    size={14}
                    color={
                        state.activePlaylistId === null
                            ? "var(--gold)"
                            : "var(--text-secondary)"
                    }
                />
                <span
                    style={{
                        color:
                            state.activePlaylistId === null
                                ? "var(--gold)"
                                : "var(--text-secondary)",
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "0.78rem",
                        letterSpacing: "0.05em",
                        fontWeight: state.activePlaylistId === null ? 600 : 400,
                    }}
                >
                    All Tracks ({state.tracks.length})
                </span>
            </button>

            {/* Playlists */}
            <div className="space-y-1" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {state.playlists.map((playlist) => {
                    const isActive = state.activePlaylistId === playlist.id;
                    const isAdding = addingToPlaylist === playlist.id;

                    return (
                        <div
                            key={playlist.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem 0.75rem",
                                background: isActive ? "rgba(201, 168, 76, 0.08)" : "transparent",
                                border: `1px solid ${isActive ? "rgba(201, 168, 76, 0.25)" : "transparent"}`,
                                transition: "all 0.2s",
                            }}
                        >
                            <button
                                onClick={() => selectPlaylist(isActive ? null : playlist.id)}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.6rem",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                <div
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background: isActive ? "var(--gold)" : "var(--text-muted)",
                                        flexShrink: 0,
                                    }}
                                />
                                <div style={{ overflow: "hidden" }}>
                                    <p
                                        style={{
                                            color: isActive ? "var(--gold)" : "var(--text-secondary)",
                                            fontFamily: "'Space Grotesk', sans-serif",
                                            fontSize: "0.78rem",
                                            fontWeight: isActive ? 600 : 400,
                                            letterSpacing: "0.03em",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {playlist.name}
                                    </p>
                                    <p
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "0.65rem",
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        {playlist.trackIds.length} tracks
                                    </p>
                                </div>
                            </button>

                            {/* Add current track */}
                            {currentTrack && (
                                <button
                                    onClick={() => addCurrentToPlaylist(playlist.id)}
                                    title={`Add "${currentTrack.title}" to playlist`}
                                    style={{
                                        background: isAdding
                                            ? "rgba(201, 168, 76, 0.2)"
                                            : "transparent",
                                        border: "1px solid rgba(201, 168, 76, 0.2)",
                                        color: isAdding ? "var(--gold)" : "var(--text-muted)",
                                        width: 22,
                                        height: 22,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        flexShrink: 0,
                                    }}
                                >
                                    {isAdding ? <Check size={11} /> : <Plus size={11} />}
                                </button>
                            )}

                            {/* Delete */}
                            <button
                                onClick={() => deletePlaylist(playlist.id)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    width: 22,
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "color 0.2s",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) =>
                                    ((e.currentTarget as HTMLElement).style.color = "#8B1A1A")
                                }
                                onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLElement).style.color =
                                    "var(--text-muted)")
                                }
                            >
                                <Trash2 size={11} />
                            </button>
                        </div>
                    );
                })}

                {state.playlists.length === 0 && !showCreateForm && (
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "0.7rem",
                            textAlign: "center",
                            padding: "0.75rem 0",
                            letterSpacing: "0.05em",
                        }}
                    >
                        No playlists yet
                    </p>
                )}
            </div>
        </div>
    );
}
