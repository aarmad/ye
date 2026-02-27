"use client";

import { useCallback } from "react";
import { useAudio } from "@/context/AudioContext";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Repeat1,
    Volume2,
    VolumeX,
    Volume1,
} from "lucide-react";

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
    if (muted || volume === 0) return <VolumeX size={16} />;
    if (volume < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
}

export default function PlayerControls() {
    const {
        state,
        dispatch,
        currentTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seekTo,
        setVolume,
        formatTime,
    } = useAudio();

    const handleSeek = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            seekTo(parseFloat(e.target.value));
        },
        [seekTo]
    );

    const handleVolume = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setVolume(parseFloat(e.target.value));
        },
        [setVolume]
    );

    const progressPercent =
        state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

    const buttonStyle = (active = false, size: "sm" | "md" | "lg" = "md") => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "rgba(201, 168, 76, 0.15)" : "transparent",
        border: `1px solid ${active ? "rgba(201, 168, 76, 0.4)" : "rgba(255,255,255,0.05)"}`,
        color: active ? "var(--gold)" : "var(--text-secondary)",
        width: size === "lg" ? 52 : size === "md" ? 40 : 32,
        height: size === "lg" ? 52 : size === "md" ? 40 : 32,
        borderRadius: "50%",
        cursor: "pointer",
        transition: "all 0.25s ease",
        flexShrink: 0,
    });

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                position: "relative",
                zIndex: 100,
            }}
        >
            {/* Track info */}
            {currentTrack ? (
                <div
                    key={currentTrack.id}
                    style={{ textAlign: "center" }}
                    className="fade-up"
                >
                    <p
                        style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "1.8rem",
                            letterSpacing: "0.06em",
                            color: "var(--text-primary)",
                            lineHeight: 1,
                            marginBottom: "0.3rem",
                        }}
                    >
                        {currentTrack.title}
                    </p>
                    <p
                        style={{
                            color: "var(--gold)",
                            fontSize: "0.7rem",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            fontWeight: 500,
                        }}
                    >
                        {currentTrack.artist}
                    </p>
                </div>
            ) : (
                <div style={{ textAlign: "center" }}>
                    <p
                        style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "1.8rem",
                            letterSpacing: "0.06em",
                            color: "var(--text-muted)",
                            lineHeight: 1,
                        }}
                    >
                        NO TRACK SELECTED
                    </p>
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "0.7rem",
                            letterSpacing: "0.15em",
                        }}
                    >
                        Load files to begin
                    </p>
                </div>
            )}

            {/* Progress bar */}
            <div>
                <div
                    style={{
                        position: "relative",
                        height: 3,
                        background: "var(--border)",
                        borderRadius: 2,
                        cursor: "pointer",
                    }}
                >
                    {/* Fill */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: `${progressPercent}%`,
                            background:
                                "linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-light))",
                            borderRadius: 2,
                            transition: "width 0.1s linear",
                            boxShadow: "0 0 8px rgba(201, 168, 76, 0.5)",
                        }}
                    />
                    <input
                        type="range"
                        className="progress-bar"
                        min={0}
                        max={state.duration || 100}
                        value={state.currentTime}
                        onChange={handleSeek}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            transform: "translateY(-50%)",
                            width: "100%",
                            opacity: 0,
                            height: 20,
                            cursor: "pointer",
                        }}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "0.5rem",
                    }}
                >
                    <span
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.7rem",
                            fontVariantNumeric: "tabular-nums",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {formatTime(state.currentTime)}
                    </span>
                    <span
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "0.7rem",
                            fontVariantNumeric: "tabular-nums",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {formatTime(state.duration)}
                    </span>
                </div>
            </div>

            {/* Playback controls */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                }}
            >
                {/* Shuffle */}
                <button
                    onClick={() => dispatch({ type: "TOGGLE_SHUFFLE" })}
                    style={buttonStyle(state.isShuffled, "sm")}
                    title="Shuffle"
                    onMouseEnter={(e) => {
                        if (!state.isShuffled) {
                            (e.currentTarget as HTMLElement).style.color = "var(--gold)";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.3)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!state.isShuffled) {
                            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                        }
                    }}
                >
                    <Shuffle size={14} />
                </button>

                {/* Previous */}
                <button
                    onClick={prevTrack}
                    style={buttonStyle(false, "md")}
                    title="Previous"
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.2)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                    }}
                >
                    <SkipBack size={18} />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                            "linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)",
                        border: "none",
                        color: "var(--black)",
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        boxShadow: state.isPlaying
                            ? "0 0 30px rgba(201, 168, 76, 0.5), 0 0 60px rgba(201, 168, 76, 0.2)"
                            : "0 4px 15px rgba(0,0,0,0.3)",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    }}
                >
                    {state.isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                </button>

                {/* Next */}
                <button
                    onClick={nextTrack}
                    style={buttonStyle(false, "md")}
                    title="Next"
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.2)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                    }}
                >
                    <SkipForward size={18} />
                </button>

                {/* Repeat */}
                <button
                    onClick={() => dispatch({ type: "CYCLE_REPEAT" })}
                    style={buttonStyle(state.repeatMode !== "none", "sm")}
                    title={`Repeat: ${state.repeatMode}`}
                    onMouseEnter={(e) => {
                        if (state.repeatMode === "none") {
                            (e.currentTarget as HTMLElement).style.color = "var(--gold)";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.3)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (state.repeatMode === "none") {
                            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                        }
                    }}
                >
                    {state.repeatMode === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
                </button>
            </div>

            {/* Volume */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0 0.5rem",
                }}
            >
                <button
                    onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "var(--gold)")
                    }
                    onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")
                    }
                >
                    <VolumeIcon volume={state.volume} muted={state.isMuted} />
                </button>
                <div style={{ flex: 1, position: "relative", height: 2, background: "var(--border)", borderRadius: 1 }}>
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: `${state.isMuted ? 0 : state.volume * 100}%`,
                            background: "var(--gold)",
                            borderRadius: 1,
                            opacity: 0.7,
                        }}
                    />
                    <input
                        type="range"
                        className="volume-bar"
                        min={0}
                        max={1}
                        step={0.01}
                        value={state.isMuted ? 0 : state.volume}
                        onChange={handleVolume}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            transform: "translateY(-50%)",
                            width: "100%",
                            opacity: 0,
                            height: 16,
                            cursor: "pointer",
                        }}
                    />
                </div>
                <span
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "0.65rem",
                        width: 28,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {Math.round((state.isMuted ? 0 : state.volume) * 100)}
                </span>
            </div>
        </div>
    );
}
