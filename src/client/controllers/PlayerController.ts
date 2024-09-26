import { Player } from '../components/Player';
import {
	BackendPlayerState,
	BackendPlayers,
	PlayerColor,
	Players,
} from '../common/types';

const frontendPlayers: Players = {};
let backendPlayers: BackendPlayers = {};
let backendTime: number = 0.0;

export function getBackendTime(): number {
	return backendTime;
}

export function addPlayer(playerId: string, player: Player): boolean {
	if (frontendPlayers[playerId]) {
		console.error(`Player with ID ${playerId} already exists.`);
		return false;
	}
	frontendPlayers[playerId] = player;
	console.log(`Player with ID ${playerId} created.`);
	return true;
}

export function removePlayer(playerId: string): boolean {
	if (!frontendPlayers[playerId]) {
		console.error(`Player with ID ${playerId} does not exist.`);
		return false;
	}
	delete frontendPlayers[playerId];
	console.log(`Player with ID ${playerId} removed.`);
	return true;
}

// get a player by socket.id
export function getPlayer(playerId: string): Player | null {
	return frontendPlayers[playerId];
}

export function getPlayers(): Players {
	return frontendPlayers;
}

export function getBackendPlayer(playerId: string): BackendPlayerState | null {
	return backendPlayers[playerId];
}

export function getBackendPlayers(): BackendPlayers {
	return backendPlayers;
}

// executed on server broadcast
export function setAuthoritativeState(
	backendPlayerStates: BackendPlayers,
	backendTime: number
) {
	backendPlayers = backendPlayerStates;
	backendTime = backendTime;
}