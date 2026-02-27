"use client";

import { useEffect, useRef, useState } from "react";
import { useAudio } from "@/context/AudioContext";
import AudioVisualizer from "./AudioVisualizer";
import { Disc } from "lucide-react";

// Vinyl record component with CSS animation
function VinylRecord({ isPlaying, coverArt, title, trackNumber }: { isPlaying: boolean; coverArt?: string | null; title?: string; trackNumber?: number }) {
    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            {/* Outer ring glow */}
            <div
                style={{
                    position: "absolute",
                    width: "85%",
                    height: "85%",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 75%)",
                    transition: "opacity 1s ease",
                    opacity: isPlaying ? 0.8 : 0.3,
                }}
            />

            {/* Vinyl disc container - spins everything inside */}
            <div
                className={isPlaying ? "vinyl-spinning" : "vinyl-paused"}
                style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    maxWidth: "360px",
                    borderRadius: "50%",
                    background: "#050505",
                    boxShadow: `
                        0 20px 80px rgba(0,0,0,0.95),
                        0 0 0 1px rgba(201, 168, 76, 0.1),
                        inset 0 0 100px rgba(0,0,0,0.9)
                    `,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Vinyl texture/grooves using radial gradient */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: `repeating-radial-gradient(
                        circle at center,
                        #111 0,
                        #111 1px,
                        #080808 2px,
                        #080808 4px
                    )`,
                }} />

                {/* Grooves highlight (shine) */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: `conic-gradient(
                        from 0deg, 
                        transparent 0%, 
                        rgba(255,255,255,0.03) 10%, 
                        transparent 20%, 
                        transparent 45%, 
                        rgba(255,255,255,0.03) 55%, 
                        transparent 65%, 
                        transparent 100%
                    )`,
                    pointerEvents: "none"
                }} />

                {/* Track Title on the disc (spinning) */}
                {title && (
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "68%",
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.45)",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.6rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                    }}>
                        <span style={{ marginRight: "0.4rem", color: "rgba(201,168,76,0.5)" }}>
                            {trackNumber ? String(trackNumber).padStart(2, '0') + '.' : ''}
                        </span>
                        {title}
                    </div>
                )}

                {/* Center Label */}
                <div
                    style={{
                        position: "relative",
                        width: "35%",
                        height: "35%",
                        borderRadius: "50%",
                        background: coverArt ? `url(${coverArt}) center/cover no-repeat` : "var(--surface-3)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 0 50px rgba(0,0,0,1)",
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {!coverArt && <Disc size={40} color="rgba(201,168,76,0.2)" />}

                    {/* Spindle hole shadow */}
                    <div style={{
                        width: "15%",
                        height: "15%",
                        borderRadius: "50%",
                        background: "#020202",
                        boxShadow: "inset 0 0 15px rgba(0,0,0,1)",
                        zIndex: 3,
                        border: "1px solid rgba(255,255,255,0.05)"
                    }} />
                </div>
            </div>

            {/* Tonearm */}
            <div
                style={{
                    position: "absolute",
                    top: "5%",
                    right: "5%",
                    width: "48%",
                    height: "80%",
                    pointerEvents: "none",
                    zIndex: 10,
                    transform: isPlaying ? "rotate(-14deg)" : "rotate(2deg)",
                    transformOrigin: "85% 15%",
                    transition: "transform 1.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <svg viewBox="0 0 100 180" style={{ width: "100%", height: "100%" }}>
                    <defs>
                        <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: "#333", stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: "#666", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: "#333", stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    {/* Base */}
                    <circle cx="85" cy="15" r="18" fill="rgba(15,15,15,0.95)" stroke="var(--gold-dim)" strokeWidth="0.5" />
                    <circle cx="85" cy="15" r="6" fill="var(--gold)" />

                    {/* The Arm */}
                    <path
                        d="M 85 15 C 85 60 85 100 45 135"
                        stroke="url(#metal)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M 45 135 L 25 170"
                        stroke="url(#metal)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                    />

                    {/* Stylus Head */}
                    <g transform="rotate(-35, 25, 170)">
                        <rect x="10" y="170" width="30" height="15" rx="2" fill="#111" stroke="var(--gold-dim)" strokeWidth="0.5" />
                        <rect x="23" y="180" width="4" height="8" fill="var(--gold)" />
                    </g>
                </svg>
            </div>
        </div>
    );
}

export default function VinylDisplay() {
    const { currentTrack, state } = useAudio();
    const [vizMode, setVizMode] = useState<"bars" | "wave" | "circle">("bars");

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                gap: "1.5rem",
                userSelect: "none",
                paddingBottom: "1rem"
            }}
        >
            {/* Main Vinyl Area */}
            <div style={{ flex: "1 1 0", minHeight: "380px", position: "relative" }}>
                <VinylRecord
                    isPlaying={state.isPlaying}
                    coverArt={currentTrack?.coverArt}
                    title={currentTrack?.title}
                    trackNumber={currentTrack?.trackNumber}
                />
            </div>

            {/* Visualizer & Info Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", background: "rgba(12,12,12,0.4)", padding: "1.5rem", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.05)" }}>
                {/* Visualizer Mode Controls */}
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                    {(["bars", "wave", "circle"] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setVizMode(mode)}
                            style={{
                                background: vizMode === mode ? "rgba(201, 168, 76, 0.2)" : "transparent",
                                border: `1px solid ${vizMode === mode ? "rgba(201, 168, 76, 0.4)" : "rgba(201, 168, 76, 0.1)"}`,
                                color: vizMode === mode ? "var(--gold)" : "var(--text-muted)",
                                padding: "0.25rem 0.75rem",
                                fontSize: "0.6rem",
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                borderRadius: "2px",
                                fontFamily: "'Space Grotesk', sans-serif"
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {/* Compact Visualizer */}
                <div style={{ height: vizMode === "circle" ? 110 : 70, position: "relative", opacity: state.isPlaying ? 1 : 0.4, transition: "opacity 0.5s" }}>
                    <AudioVisualizer
                        width={300}
                        height={vizMode === "circle" ? 110 : 70}
                        style={vizMode}
                        className="w-full h-full"
                    />
                </div>

                {/* Track Info */}
                {currentTrack ? (
                    <div style={{ textAlign: "center", animation: "fade-up 0.5s ease" }}>
                        <p style={{ color: "var(--gold)", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                            {currentTrack.artist}
                        </p>
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "var(--text-primary)", letterSpacing: "0.05em", lineHeight: 1.1 }}>
                            {currentTrack.title}
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.4rem", letterSpacing: "0.05em" }}>
                            {currentTrack.album} · {currentTrack.year}
                        </p>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "1rem" }}>
                        SELECT A TRACK
                    </div>
                )}
            </div>
        </div>
    );
}
