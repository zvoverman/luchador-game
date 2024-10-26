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

export function handleSetUsernameResponse(
	data: setUsernameResponseInterface,
	id: string | undefined
) {
	/**
	 * FIXME: Backend player still recieves input and moves accordingly...
	 *
	 * While user is on username input screen, they should NOT be able to move.
	 * Only once the game is displayed should the server begin listening for input.
	 */

	const playerStates: BackendPlayers = data.state;
	const backendTime: number = data.time;

	// save new player to player states
	setAuthoritativeState(playerStates, backendTime);

	// display the game instead of username input screen
	displayGame();
}
