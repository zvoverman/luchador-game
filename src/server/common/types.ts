import { Player } from './player';

export interface Players {
	[id: string]: Player;
}

export interface PlayerInput {
	id: string | null; // socket.id of player
	event: string;
	timestamp: number;
}

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

/**
 *  Server -> Client
 */

export enum ServerToClientEvent {
	UPDATE_GAME_STATE = 'updateGameState',
	REMOVE_PLAYER = 'removePlayer',
	ERROR = 'error',
	CONNECTED = 'connected',
	SET_USERNAME = 'setUsername',
}

export interface ServerToClientEvents {
	[ServerToClientEvent.UPDATE_GAME_STATE]: UpdateGameStatePayload;
	[ServerToClientEvent.REMOVE_PLAYER]: RemovePlayerPayload;
	[ServerToClientEvent.ERROR]: ErrorPayload;
	[ServerToClientEvent.CONNECTED]: ConnectedPayload;
	[ServerToClientEvent.SET_USERNAME]: SetUsernamePayload;
}

export interface UpdateGameStatePayload {
	state: Players;
}

export interface ErrorPayload {
	message: string;
}

export interface SetUsernamePayload {
	username: string | null;
	state: Players;
	time: number;
}

export interface RemovePlayerPayload {
	playerToRemove: string; // playerId
	state: Players;
	time: number;
}

export interface ConnectedPayload {}

/**
 * 	Client -> Server
 */

export enum ClientToServerEvent {
	PROCESS_CLIENT_INPUT = 'processClientInput',
	VALIDATE_USERNAME = 'validateUsername',
}

export interface ProcessClientInputPayload {
	input: PlayerInput;
}

export interface ValidateUsernamePayload {
	userInput: string;
}
