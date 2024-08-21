import { BackendPlayers, Players } from '../common/types';
import { setAuthoritativeState } from '../controllers/PlayerController';

export function handleUpdatePlayers(playerStates: BackendPlayers): void {
	setAuthoritativeState(playerStates);
}
