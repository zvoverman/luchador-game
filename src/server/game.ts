import { Player } from './common/player';
import { PlayerInput } from './common/types';
import { emitMessage } from './socket';
import { getPlayers } from './controllers/PlayerController';
import { processInputQueue } from './controllers/InputController';

let lastTs: number | undefined;

/**
 * MAIN GAME LOOP
 */
export function gameLoop(): void {
	const nowTs: number = performance.now();
	const previousTs: number = lastTs ?? nowTs;
	const deltaTime: number = (nowTs - previousTs) / 1000.0;
	lastTs = nowTs;

	processInputQueue();

	physics(deltaTime);

	// send authoritative state to clients
	emitMessage('updatePlayers', getPlayers(), 'game');
}

function physics(dt: number) {
	const players = getPlayers();

	for (const id in players) {
		const player = players[id];
		player.applyForces(dt);
		player.move(dt);
	}
}
