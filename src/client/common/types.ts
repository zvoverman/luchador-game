import { Player } from '../components/Player';

export interface Players {
	[id: string]: Player;
}

export interface BackendPlayers {
	[id: string]: BackendPlayerState;
}

export type BackendPlayerState = {
	id: string;
	position: { x: number; y: number };
	velocity: { x: number; y: number };
	width: number;
	height: number;
	currentHealth: number;
	playerColor: PlayerColor;
	timestamp: number;
	timeSinceInput: number;
	username: string;
};

export type RawPlayerInput = {
	event?: GameEvent;
};

export type PlayerInput = {
	event: GameEvent;
	timestamp: number;
};

export type InputQueue = Array<PlayerInput>;

export enum PlayerColor {
	BLUE = 0,
	PURPLE = 1,
	ORANGE = 2,
	RED = 3,
}

export enum GameEvent {
	JUMP = 'Jump',
	RUN_LEFT = 'Run-Left',
	RUN_RIGHT = 'Run-Right',
	STOPPING = 'Stopping',
	STOPPED = 'Stopped',
}
