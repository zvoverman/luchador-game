import { BackendPlayers, Players } from '../common/types';
import { setAuthoritativeState } from '../controllers/PlayerController';

export function handleUpdatePlayers(
	playerStates: BackendPlayers,
	backendTime: number
): void {
	setAuthoritativeState(playerStates, backendTime);
}
