import { displayGame } from '..';
import { BackendPlayers } from '../common/types';
import { setAuthoritativeState } from '../controllers/PlayerController';

export function handleUpdatePlayers(playerStates: BackendPlayers): void {
	setAuthoritativeState(playerStates);
}

export function handleSetUsernameResponse(
	username: string,
	gameState: BackendPlayers
) {
	sessionStorage.setItem('username', username);
	setAuthoritativeState(gameState);
	displayGame();
}
