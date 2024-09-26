import { Player } from './player';

export interface Players {
	[id: string]: Player;
}

export type PlayerInput = {
	id: string | null; // socket.id of player
	event: string;
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
}
