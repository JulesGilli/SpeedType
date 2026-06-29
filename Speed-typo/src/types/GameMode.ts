// src/types/GameMode.ts
export type GameMode = 'classique' | 'inversé' | 'leet' | 'memoire' | 'blind' | 'endless';

// Modes Hardcore (débloqués au rang Master+).
export type HardcoreMode = 'chaos' | 'sudden';

// Mode réellement joué par GameScreen (base ou hardcore).
export type PlayMode = GameMode | HardcoreMode;
