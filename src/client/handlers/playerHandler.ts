import { displayGame } from '..';
import { BackendPlayers } from '../common/types';
import { setAuthoritativeState } from '../controllers/PlayerController';

export function handleUpdatePlayers(
	playerStates: BackendPlayers,
	backendTime: number
): void {
	setAuthoritativeState(playerStates, backendTime);
}

export interface setUsernameResponseInterface {
	username: string | null;
	state: BackendPlayers;
	time: number;
}

export function handleSetUsernameResponse(data: setUsernameResponseInterface) {
	const playerStates: BackendPlayers = data.state;
	const backendTime: number = data.time;

	// save new player to player states
	setAuthoritativeState(playerStates, backendTime);

	// display the game instead of username input screen
	displayGame();
}
