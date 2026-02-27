"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    useRef,
    useCallback,
    useEffect,
    ReactNode,
} from "react";

export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    url: string;
    coverArt?: string;
    year?: string;
    file?: File;
    trackNumber?: number;
}

export interface Album {
    id: string;
    year: string;
    artist: string;
    title: string;
    folderName: string;
    coverArt: string | null;
    tracks: Track[];
}

export interface Playlist {
    id: string;
    name: string;
    trackIds: string[];
    createdAt: Date;
}

interface AudioState {
    tracks: Track[];
    albums: Album[];
    currentTrackIndex: number;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isShuffled: boolean;
    repeatMode: "none" | "one" | "all";
    playlists: Playlist[];
    activePlaylistId: string | null;
    activeAlbumId: string | null;
    showPlaylistModal: boolean;
    showLibrary: boolean;
    searchQuery: string;
    isLoading: boolean;
    libraryLoaded: boolean;
}

type AudioAction =
    | { type: "SET_TRACKS"; payload: Track[] }
    | { type: "ADD_TRACKS"; payload: Track[] }
    | { type: "SET_ALBUMS"; payload: Album[] }
    | { type: "SET_CURRENT_TRACK"; payload: number }
    | { type: "SET_PLAYING"; payload: boolean }
    | { type: "SET_CURRENT_TIME"; payload: number }
    | { type: "SET_DURATION"; payload: number }
    | { type: "SET_VOLUME"; payload: number }
    | { type: "TOGGLE_MUTE" }
    | { type: "TOGGLE_SHUFFLE" }
    | { type: "CYCLE_REPEAT" }
    | { type: "CREATE_PLAYLIST"; payload: string }
    | { type: "DELETE_PLAYLIST"; payload: string }
    | { type: "ADD_TO_PLAYLIST"; payload: { playlistId: string; trackId: string } }
    | { type: "REMOVE_FROM_PLAYLIST"; payload: { playlistId: string; trackId: string } }
    | { type: "SET_ACTIVE_PLAYLIST"; payload: string | null }
    | { type: "SET_ACTIVE_ALBUM"; payload: string | null }
    | { type: "TOGGLE_PLAYLIST_MODAL" }
    | { type: "TOGGLE_LIBRARY" }
    | { type: "SET_SEARCH_QUERY"; payload: string }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_LIBRARY_LOADED"; payload: boolean };

const initialState: AudioState = {
    tracks: [],
    albums: [],
    currentTrackIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    isShuffled: false,
    repeatMode: "none",
    playlists: [],
    activePlaylistId: null,
    activeAlbumId: null,
    showPlaylistModal: false,
    showLibrary: false,
    searchQuery: "",
    isLoading: false,
    libraryLoaded: false,
};

function audioReducer(state: AudioState, action: AudioAction): AudioState {
    switch (action.type) {
        case "SET_TRACKS":
            return { ...state, tracks: action.payload };
        case "ADD_TRACKS":
            return { ...state, tracks: [...state.tracks, ...action.payload] };
        case "SET_ALBUMS":
            // Flatten all album tracks into the main tracks array
            const allTracks = action.payload.flatMap((album) => album.tracks);
            return { ...state, albums: action.payload, tracks: allTracks, libraryLoaded: true };
        case "SET_CURRENT_TRACK":
            return { ...state, currentTrackIndex: action.payload };
        case "SET_PLAYING":
            return { ...state, isPlaying: action.payload };
        case "SET_CURRENT_TIME":
            return { ...state, currentTime: action.payload };
        case "SET_DURATION":
            return { ...state, duration: action.payload };
        case "SET_VOLUME":
            return { ...state, volume: action.payload };
        case "TOGGLE_MUTE":
            return { ...state, isMuted: !state.isMuted };
        case "TOGGLE_SHUFFLE":
            return { ...state, isShuffled: !state.isShuffled };
        case "CYCLE_REPEAT":
            const modes: AudioState["repeatMode"][] = ["none", "one", "all"];
            const currentIdx = modes.indexOf(state.repeatMode);
            return { ...state, repeatMode: modes[(currentIdx + 1) % modes.length] };
        case "CREATE_PLAYLIST":
            const newPlaylist: Playlist = {
                id: `playlist-${Date.now()}`,
                name: action.payload,
                trackIds: [],
                createdAt: new Date(),
            };
            return { ...state, playlists: [...state.playlists, newPlaylist] };
        case "DELETE_PLAYLIST":
            return {
                ...state,
                playlists: state.playlists.filter((p) => p.id !== action.payload),
                activePlaylistId: state.activePlaylistId === action.payload ? null : state.activePlaylistId,
            };
        case "ADD_TO_PLAYLIST":
            return {
                ...state,
                playlists: state.playlists.map((p) =>
                    p.id === action.payload.playlistId
                        ? { ...p, trackIds: [...new Set([...p.trackIds, action.payload.trackId])] }
                        : p
                ),
            };
        case "REMOVE_FROM_PLAYLIST":
            return {
                ...state,
                playlists: state.playlists.map((p) =>
                    p.id === action.payload.playlistId
                        ? { ...p, trackIds: p.trackIds.filter((id) => id !== action.payload.trackId) }
                        : p
                ),
            };
        case "SET_ACTIVE_PLAYLIST":
            return { ...state, activePlaylistId: action.payload };
        case "SET_ACTIVE_ALBUM":
            return { ...state, activeAlbumId: action.payload };
        case "TOGGLE_PLAYLIST_MODAL":
            return { ...state, showPlaylistModal: !state.showPlaylistModal };
        case "TOGGLE_LIBRARY":
            return { ...state, showLibrary: !state.showLibrary };
        case "SET_SEARCH_QUERY":
            return { ...state, searchQuery: action.payload };
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        case "SET_LIBRARY_LOADED":
            return { ...state, libraryLoaded: action.payload };
        default:
            return state;
    }
}

interface AudioContextType {
    state: AudioState;
    dispatch: React.Dispatch<AudioAction>;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    analyserRef: React.RefObject<AnalyserNode | null>;
    audioContextRef: React.RefObject<AudioContext | null>;
    currentTrack: Track | null;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    seekTo: (time: number) => void;
    setVolume: (vol: number) => void;
    playTrack: (index: number) => void;
    nextTrack: () => void;
    prevTrack: () => void;
    loadFiles: (files: FileList) => void;
    loadLibrary: () => Promise<void>;
    formatTime: (seconds: number) => string;
    displayedTracks: Track[];
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(audioReducer, initialState);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    const currentTrack = state.currentTrackIndex >= 0 ? state.tracks[state.currentTrackIndex] : null;

    const initAudioContext = useCallback(() => {
        if (!audioRef.current) return;
        if (!audioContextRef.current) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            sourceRef.current = source;
        }
        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }
    }, []);

    const play = useCallback(() => {
        initAudioContext();
        audioRef.current?.play();
        dispatch({ type: "SET_PLAYING", payload: true });
    }, [initAudioContext]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        dispatch({ type: "SET_PLAYING", payload: false });
    }, []);

    const togglePlay = useCallback(() => {
        if (state.isPlaying) pause();
        else play();
    }, [state.isPlaying, play, pause]);

    const seekTo = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            dispatch({ type: "SET_CURRENT_TIME", payload: time });
        }
    }, []);

    const setVolume = useCallback((vol: number) => {
        if (audioRef.current) audioRef.current.volume = vol;
        dispatch({ type: "SET_VOLUME", payload: vol });
    }, []);

    const playTrack = useCallback(
        (index: number) => {
            if (index < 0 || index >= state.tracks.length) return;
            dispatch({ type: "SET_CURRENT_TRACK", payload: index });
        },
        [state.tracks.length]
    );

    const nextTrack = useCallback(() => {
        if (state.tracks.length === 0) return;
        if (state.repeatMode === "one") {
            seekTo(0);
            play();
            return;
        }
        let next: number;
        if (state.isShuffled) {
            next = Math.floor(Math.random() * state.tracks.length);
        } else {
            next = (state.currentTrackIndex + 1) % state.tracks.length;
        }
        if (state.repeatMode === "none" && next === 0 && state.currentTrackIndex === state.tracks.length - 1) {
            pause();
            return;
        }
        playTrack(next);
    }, [state, play, pause, seekTo, playTrack]);

    const prevTrack = useCallback(() => {
        if (state.tracks.length === 0) return;
        if (state.currentTime > 3) {
            seekTo(0);
            return;
        }
        const prev = state.currentTrackIndex <= 0 ? state.tracks.length - 1 : state.currentTrackIndex - 1;
        playTrack(prev);
    }, [state, seekTo, playTrack]);

    const formatTime = useCallback((seconds: number): string => {
        if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }, []);

    const loadFiles = useCallback(async (files: FileList) => {
        dispatch({ type: "SET_LOADING", payload: true });
        const newTracks: Track[] = [];

        for (const file of Array.from(files)) {
            if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|flac|wav|ogg|m4a|aac)$/i)) continue;

            const url = URL.createObjectURL(file);
            const trackId = `track-${Date.now()}-${Math.random()}`;

            // Try to extract metadata from filename
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            let title = nameWithoutExt;
            let artist = "Unknown Artist";
            let album = "Unknown Album";

            // Pattern: "Artist - Title" or "Track. Artist - Title"
            const match = nameWithoutExt.match(/^(?:\d+[\.\s]+)?(?:(.+?)\s*[-–]\s*)?(.+)$/);
            if (match) {
                if (match[1]) {
                    artist = match[1].trim();
                    title = match[2].trim();
                } else {
                    title = match[2].trim();
                }
            }

            // Try to get duration via Audio element
            const duration = await new Promise<number>((resolve) => {
                const tempAudio = new Audio(url);
                tempAudio.addEventListener("loadedmetadata", () => resolve(tempAudio.duration));
                tempAudio.addEventListener("error", () => resolve(0));
                setTimeout(() => resolve(0), 5000);
            });

            newTracks.push({
                id: trackId,
                title,
                artist,
                album,
                duration,
                url,
                file,
                year: new Date().getFullYear().toString(),
            });
        }

        if (newTracks.length > 0) {
            dispatch({ type: "ADD_TRACKS", payload: newTracks });
            if (state.currentTrackIndex === -1) {
                dispatch({ type: "SET_CURRENT_TRACK", payload: 0 });
            }
        }
        dispatch({ type: "SET_LOADING", payload: false });
    }, [state.currentTrackIndex]);

    const loadLibrary = useCallback(async () => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const res = await fetch("/api/library");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.albums) {
                dispatch({ type: "SET_ALBUMS", payload: data.albums });
                // Auto-select first track
                const firstTrack = data.albums[0]?.tracks[0];
                if (firstTrack) {
                    // currentTrackIndex will be 0 since tracks are flattened
                    dispatch({ type: "SET_CURRENT_TRACK", payload: 0 });
                }
            }
        } catch (err) {
            console.error("Failed to load library:", err);
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, []);

    // When current track changes, update audio src and play
    useEffect(() => {
        if (!audioRef.current || !currentTrack) return;
        audioRef.current.src = currentTrack.url;
        audioRef.current.volume = state.volume;
        audioRef.current.load();
        if (state.isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    dispatch({ type: "SET_PLAYING", payload: false });
                });
            }
        }
    }, [currentTrack?.id]);

    // Auto-play when track loads if isPlaying is true
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            dispatch({ type: "SET_CURRENT_TIME", payload: audio.currentTime });
        };
        const handleDurationChange = () => {
            dispatch({ type: "SET_DURATION", payload: audio.duration });
        };
        const handleEnded = () => {
            nextTrack();
        };
        const handlePlay = () => dispatch({ type: "SET_PLAYING", payload: true });
        const handlePause = () => dispatch({ type: "SET_PLAYING", payload: false });

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("durationchange", handleDurationChange);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("durationchange", handleDurationChange);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
        };
    }, [nextTrack]);

    // Get currently displayed tracks (filtered/playlist/album)
    const displayedTracks = React.useMemo(() => {
        let tracks = state.tracks;
        if (state.activePlaylistId) {
            const playlist = state.playlists.find((p) => p.id === state.activePlaylistId);
            if (playlist) {
                tracks = playlist.trackIds
                    .map((id) => state.tracks.find((t) => t.id === id))
                    .filter(Boolean) as Track[];
            }
        } else if (state.activeAlbumId) {
            const album = state.albums.find((a) => a.id === state.activeAlbumId);
            if (album) {
                tracks = album.tracks;
            }
        }

        if (state.searchQuery) {
            const q = state.searchQuery.toLowerCase();
            tracks = tracks.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.artist.toLowerCase().includes(q) ||
                    t.album.toLowerCase().includes(q)
            );
        }
        return tracks;
    }, [state.tracks, state.activePlaylistId, state.activeAlbumId, state.playlists, state.albums, state.searchQuery]);

    return (
        <AudioContext.Provider
            value={{
                state,
                dispatch,
                audioRef,
                analyserRef,
                audioContextRef,
                currentTrack,
                play,
                pause,
                togglePlay,
                seekTo,
                setVolume,
                playTrack,
                nextTrack,
                prevTrack,
                loadFiles,
                loadLibrary,
                formatTime,
                displayedTracks,
            }}
        >
            <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const ctx = useContext(AudioContext);
    if (!ctx) throw new Error("useAudio must be used within AudioProvider");
    return ctx;
}
