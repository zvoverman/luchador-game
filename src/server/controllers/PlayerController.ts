import { Player } from '../common/player';
import { Players } from '../common/types';

const backEndPlayers: Players = {};

export function addPlayer(playerId: string): boolean {
	if (backEndPlayers[playerId]) {
		console.error(`Player with ID ${playerId} already exists.`);
		return false;
	}
	const player = new Player(playerId);
	backEndPlayers[player.id] = player;
	console.log(`Player ${player.id} added.`);
	return true;
}

export function removePlayer(playerId: string): boolean {
	if (!backEndPlayers[playerId]) {
		console.error(`Player with ID ${playerId} does not exist.`);
		return false;
	}
	delete backEndPlayers[playerId];
	console.log(`Player with ID ${playerId} removed.`);
	return true;
}

// get a player by socket.id
export function getPlayer(playerId: string): Player | undefined {
	return backEndPlayers[playerId];
}

export function getPlayers(): Players {
	return backEndPlayers;
}
