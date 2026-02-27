"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAudio } from "@/context/AudioContext";

interface AudioVisualizerProps {
    width?: number;
    height?: number;
    className?: string;
    style?: "bars" | "wave" | "circle";
}

export default function AudioVisualizer({
    width = 400,
    height = 120,
    className = "",
    style = "bars",
}: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const { analyserRef, state } = useAudio();

    const drawBars = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            dataArray: Uint8Array,
            bufferLength: number,
            w: number,
            h: number
        ) => {
            ctx.clearRect(0, 0, w, h);

            const barCount = 64;
            const barWidth = (w / barCount) * 0.6;
            const gap = (w / barCount) * 0.4;
            let x = 0;

            for (let i = 0; i < barCount; i++) {
                const idx = Math.floor((i / barCount) * bufferLength);
                const value = dataArray[idx] / 255;
                const barH = value * h;

                // Gold gradient
                const gradient = ctx.createLinearGradient(0, h - barH, 0, h);
                gradient.addColorStop(0, `rgba(232, 201, 122, ${0.9 * value + 0.1})`);
                gradient.addColorStop(0.5, `rgba(201, 168, 76, ${0.7 * value + 0.1})`);
                gradient.addColorStop(1, `rgba(139, 105, 20, ${0.5 * value + 0.05})`);

                ctx.fillStyle = gradient;
                ctx.fillRect(x, h - barH, barWidth, barH);

                // Glow on top
                if (value > 0.3) {
                    ctx.shadowColor = "rgba(201, 168, 76, 0.8)";
                    ctx.shadowBlur = 8 * value;
                    ctx.fillRect(x, h - barH, barWidth, 2);
                    ctx.shadowBlur = 0;
                }

                x += barWidth + gap;
            }
        },
        []
    );

    const drawWave = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            analyser: AnalyserNode,
            w: number,
            h: number
        ) => {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);

            ctx.clearRect(0, 0, w, h);

            ctx.lineWidth = 2;
            const gradient = ctx.createLinearGradient(0, 0, w, 0);
            gradient.addColorStop(0, "rgba(201, 168, 76, 0.2)");
            gradient.addColorStop(0.5, "rgba(232, 201, 122, 0.9)");
            gradient.addColorStop(1, "rgba(201, 168, 76, 0.2)");
            ctx.strokeStyle = gradient;

            ctx.shadowColor = "rgba(201, 168, 76, 0.5)";
            ctx.shadowBlur = 10;

            ctx.beginPath();
            const sliceWidth = w / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                // Get the normalized wave value (-1 to 1)
                const v = (dataArray[i] / 128.0) - 1.0;
                // Amplify the wave significantly and center it
                const y = (h / 2) + v * h * 1.5;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += sliceWidth;
            }

            ctx.lineTo(w, h / 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        },
        []
    );

    const drawCircle = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            dataArray: Uint8Array,
            bufferLength: number,
            w: number,
            h: number
        ) => {
            ctx.clearRect(0, 0, w, h);

            const centerX = w / 2;
            const centerY = h / 2;
            // Make base radius larger so it escapes the vinyl cover
            const radius = Math.min(w, h) / 2.3;

            for (let i = 0; i < bufferLength; i++) {
                // Amplify circle data
                const value = Math.min(1, (dataArray[i] / 255) * 1.2);
                const angle = (i / bufferLength) * Math.PI * 2;
                const barLen = value * radius * 0.4; // Max extrusion

                const x1 = centerX + Math.cos(angle) * radius;
                const y1 = centerY + Math.sin(angle) * radius;
                const x2 = centerX + Math.cos(angle) * (radius + barLen);
                const y2 = centerY + Math.sin(angle) * (radius + barLen);

                const alpha = 0.2 + value * 0.8;
                ctx.strokeStyle = `rgba(201, 168, 76, ${alpha})`;
                ctx.lineWidth = 3; // Make it a bit more visible
                ctx.shadowColor = "rgba(201, 168, 76, 0.6)";
                ctx.shadowBlur = 8 * value;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        },
        []
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const animate = () => {
            animFrameRef.current = requestAnimationFrame(animate);

            const analyser = analyserRef.current;
            const w = canvas.width;
            const h = canvas.height;

            if (!analyser || !state.isPlaying) {
                // Draw idle state
                ctx.clearRect(0, 0, w, h);
                if (style === "bars") {
                    const barCount = 64;
                    const barWidth = (w / barCount) * 0.6;
                    const gap = (w / barCount) * 0.4;
                    let x = 0;
                    for (let i = 0; i < barCount; i++) {
                        const idleH = 2 + Math.sin(Date.now() / 1000 + i * 0.3) * 2;
                        ctx.fillStyle = "rgba(201, 168, 76, 0.15)";
                        ctx.fillRect(x, h - idleH, barWidth, idleH);
                        x += barWidth + gap;
                    }
                } else if (style === "wave") {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "rgba(201, 168, 76, 0.2)";
                    ctx.beginPath();
                    ctx.moveTo(0, h / 2);
                    ctx.lineTo(w, h / 2);
                    ctx.stroke();
                } else if (style === "circle") {
                    const centerX = w / 2;
                    const centerY = h / 2;
                    const radius = Math.min(w, h) / 3;

                    ctx.strokeStyle = "rgba(201, 168, 76, 0.2)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
                return;
            }

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            if (style === "wave") {
                drawWave(ctx, analyser, w, h);
            } else {
                analyser.getByteFrequencyData(dataArray);
                if (style === "bars") {
                    drawBars(ctx, dataArray, bufferLength, w, h);
                } else if (style === "circle") {
                    drawCircle(ctx, dataArray, bufferLength, w, h);
                }
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animFrameRef.current);
        };
    }, [analyserRef, state.isPlaying, style, drawBars, drawWave, drawCircle]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={className}
            style={{ display: "block" }}
        />
    );
}
