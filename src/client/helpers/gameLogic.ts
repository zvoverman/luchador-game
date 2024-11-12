import { GameCanvas } from '../components/GameCanvas';
import {
	addPlayer,
	getBackendPlayers,
	getPlayer,
	getPlayers,
} from '../controllers/PlayerController';
import {
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	GRAVITY_CONSTANT,
	SPEED,
	JUMP_FORCE,
	GROUND_FRICTION,
} from '../common/constants';
import {
	consumeInputFromQueue,
	eraseInputQueue,
	getInputQueue,
	getInputQueueLength,
	processRawInputs,
} from '../controllers/InputController';
import { Player } from '../components/Player';
import { socket } from './socket';
import { BackendPlayerState, GameEvent } from '../common/types';
import { Vector } from '../../lib/Vector';

let showDebug = false;
let gameCanvas: GameCanvas;
let lastRenderTime: number = 0;

// initializes canvas and begins main render loop
export function initializeGame(canvasId: string): void {
	const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
	if (!canvas) {
		console.error('Canvas not found.');
		return;
	}

	gameCanvas = new GameCanvas(canvasId, CANVAS_WIDTH, CANVAS_HEIGHT);

	requestAnimationFrame(render);
}

export function updateGameState(currentTimestamp: number): void {
	// process raw inputs
	processRawInputs(currentTimestamp);

	// update players
	updatePlayers(currentTimestamp);
}

let toggleServerReconciliation = true;
export function updatePlayers(currentTimestamp: number): void {
	const backendPlayers = getBackendPlayers();
	for (const id in backendPlayers) {
		let backendPlayer = backendPlayers[id];

		let player = getPlayer(id);
		if (!player) {
			const newPlayer = new Player(
				backendPlayer.position,
				backendPlayer.playerColor,
				backendPlayer.username
			);
			addPlayer(id, newPlayer);
		} else {
			if (id === socket.id) {
				// TODO: implement set auth state function
				player.position = backendPlayer.position;
				player.velocity = backendPlayer.velocity;
				player.username = backendPlayer.username;

				if (toggleServerReconciliation) {
					// client-side prediction and server reconciliation
					serverReconciliation(
						player,
						backendPlayer,
						currentTimestamp
					);
				} else {
					eraseInputQueue();
				}
			} else {
				player.position = backendPlayer.position;
				player.velocity = backendPlayer.velocity;
				player.username = backendPlayer.username;
			}
		}
	}
}

// TODO: Do not set player position and velocity directly, lean on Vector math harder
/**
 * Predicts client-side movement based on authoratative server state.
 *
 * @param player client state
 * @param backEndPlayer server state
 * @param currentTimestamp current timestep
 * @param deltaTime delta time for current loop iteration
 */
function serverReconciliation(
	player: Player,
	backEndPlayer: BackendPlayerState,
	currentTimestamp: number
) {
	const inputQueue = getInputQueue();
	for (let i = 0; i < getInputQueueLength(); i++) {
		const input = inputQueue[i];

		let timestep: number | null = 0;
		let friction: number = 0;

		if (input.timestamp < backEndPlayer.timestamp) {
			/* backend player has completely processed this input -> remove it process next input(s) */

			// consumeInputFromQueue() shifts the inputQueue, i must be decremented
			consumeInputFromQueue();
			i--;
		} else if (input.timestamp === backEndPlayer.timestamp) {
			/* backend player is in this state -> continue from last authoritative position */

			// calculate time spent in this state
			const start = input.timestamp + backEndPlayer.timeSinceInput * 1000;
			const now =
				// will be undefined but NOT null
				inputQueue[i + 1] === undefined
					? currentTimestamp
					: inputQueue[i + 1].timestamp;
			timestep = (now - start) / 1000.0;

			// correct outliar timesteps
			if (timestep < 0) {
				timestep = 0;
			}

			// check if player is not moving - must set timestep to 0 to avoid innacuracies in x-axis movement approximations
			if (player.velocity.x == 0) {
				movePlayerVertically(player, timestep);
				timestep = 0;
			}

			// determine friction
			switch (input.event) {
				case GameEvent.STOPPING:
					if (player.velocity.x > 0) {
						friction = -GROUND_FRICTION;
					} else {
						friction = GROUND_FRICTION;
					}
					break;
				default:
					friction = 0;
					break;
			}
		} else {
			/* backend player has not begun processing this input -> apply it from state start */

			// calculate time spent in this state
			const start = input.timestamp;
			const now =
				// will be undefined but NOT null
				inputQueue[i + 1] === undefined
					? currentTimestamp
					: inputQueue[i + 1].timestamp;
			timestep = (now - start) / 1000.0;
			if (timestep <= 0) {
				timestep = 0;
			}

			// determine friction
			switch (input.event) {
				case GameEvent.STOPPING:
					if (player.velocity.x > 0) {
						friction = -GROUND_FRICTION;
					} else {
						friction = GROUND_FRICTION;
					}
					break;
				case GameEvent.JUMP:
					player.velocity.y = -JUMP_FORCE;
					friction = 0;
					break;
				case GameEvent.RUN_RIGHT:
					player.velocity.x = SPEED;
					friction = 0;
					break;
				case GameEvent.RUN_LEFT:
					player.velocity.x = -SPEED;
					friction = 0;
					break;
			}
		}
		movePlayer(player, timestep, friction);
	}
}

// calculate the distance traveled in a particular timespan based on acceleration and velocity
function getDistanceFromTimespan(
	velocity: number,
	acceleration: number,
	timestep: number
): number {
	const distance =
		velocity * timestep + (acceleration / 2) * timestep * timestep;
	return distance;
}

function movePlayer(player: Player, timestep: number, friction: number) {
	// copy current player state
	const initialVelocity: Vector = player.velocity;
	const initialPosition: Vector = player.position;

	// calculate new player X position
	const newPlayerPosition =
		initialPosition.x +
		timestep * (player.velocity.x + (timestep * friction) / 2);
	const newPlayerVelocity = initialVelocity.x + timestep * friction;

	// check if friction rolls over
	const frictionDistance = checkFriction(
		newPlayerVelocity,
		initialVelocity.x,
		timestep,
		friction
	);

	// if friction has rolled over, override player X position
	if (frictionDistance != null) {
		player.setPosition;
		player.position.x = initialPosition.x + frictionDistance;
		player.velocity.x = 0.0;
	} else {
		// else move player in the X direction
		player.position.x = newPlayerPosition;
		player.velocity.x = newPlayerVelocity;
	}

	// move player Y position
	player.position.y +=
		timestep * (player.velocity.y + (timestep * GRAVITY_CONSTANT) / 2);
	player.velocity.y += timestep * GRAVITY_CONSTANT;

	// check if player has hit the floor
	checkGravity(player);
}

// moves player Y position
// TODO: make movePlayerHorizontally() and call both in movePlayer()
function movePlayerVertically(player: Player, timestep: number) {
	player.position.y +=
		timestep * (player.velocity.y + (timestep * GRAVITY_CONSTANT) / 2);
	player.velocity.y += timestep * GRAVITY_CONSTANT;
	checkGravity(player);
}

// checks if friction has rolled over and returns the distance travelled with friction in timestep
function checkFriction(
	playerVelocity: number,
	initialVelocity: number,
	timestep: number,
	friction: number
): number | null {
	// check if friction should be accounted for
	if (friction == 0) return null;

	// check if player has stopped
	if (!isFrictionOver(initialVelocity, playerVelocity)) return null;

	// get duraction of friction
	const frictionDuration = -initialVelocity / friction;

	// calculate distance travelled
	const distanceTraveled =
		timestep > frictionDuration
			? getDistanceFromTimespan(
					initialVelocity,
					friction,
					frictionDuration
				)
			: getDistanceFromTimespan(initialVelocity, friction, timestep);

	return distanceTraveled;
}

// checks if player has hit the floor and sets player Y position
// TODO: probably should return a bool and NOT set player Y position directly - do it in movePlayer()?
function checkGravity(player: Player) {
	if (!player) return;
	if (player.position.y + player.height >= CANVAS_HEIGHT) {
		player.velocity.y = 0;
		player.position.y = CANVAS_HEIGHT - player.height;
	}
}

// checks if friction has rolled over using initial velocity and newly calculated velocity
function isFrictionOver(
	initialVelocity: number,
	currentVelocity: number
): boolean {
	if (
		(initialVelocity < 0 && currentVelocity > 0) ||
		(initialVelocity > 0 && currentVelocity < 0)
	) {
		return true;
	} else {
		return false;
	}
}

/* RENDER */
const DEBUG_DRAW_DELAY: number = 1;
let timeSinceDebugDraw: number = 0;
let fps: number = 0;
function render(currentTime: number): void {
	const deltaTime = (currentTime - lastRenderTime) / 1000;
	lastRenderTime = currentTime;
	timeSinceDebugDraw += deltaTime;

	updateGameState(currentTime);

	gameCanvas.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	const backendPlayers = getBackendPlayers();
	if (showDebug) {
		for (const id in backendPlayers) {
			const backendPlayer = backendPlayers[id];
			debugDraw(backendPlayer);
			velocityVectorDraw(
				backendPlayer.position.x + backendPlayer.width / 2,
				backendPlayer.position.y + backendPlayer.height / 2,
				backendPlayer.position.x +
					backendPlayer.velocity.x / 2 +
					backendPlayer.width / 2,
				backendPlayer.position.y +
					backendPlayer.velocity.y / 4 +
					backendPlayer.height / 2,
				'#00ff00af'
			);
		}
	}

	const players = getPlayers();
	for (const id in players) {
		const player = players[id];
		player.draw(gameCanvas.context);

		if (showDebug) {
			// player velocity vector
			velocityVectorDraw(
				player.position.x + player.width / 2,
				player.position.y + player.height / 2,
				player.position.x + player.velocity.x / 2 + player.width / 2,
				player.position.y + player.velocity.y / 4 + player.height / 2,
				'#ff0000af'
			);
		}
	}

	if (showDebug) {
		if (timeSinceDebugDraw > DEBUG_DRAW_DELAY / 10) {
			fps = Math.floor(1 / deltaTime);
			timeSinceDebugDraw = 0;
		}
		showFPS(fps.toString());
	}

	requestAnimationFrame(render);
}

export function setShowDebug(flag: boolean): void {
	showDebug = flag;
}

export function getShowDebug(): boolean {
	return showDebug;
}

export function setToggleReconciliation(flag: boolean): void {
	toggleServerReconciliation = flag;
}

export function getToggleReconciliation(): boolean {
	return toggleServerReconciliation;
}

function debugDraw(p: BackendPlayerState | null) {
	if (!p) return;

	const c = gameCanvas.context;
	c.save();
	c.beginPath();
	c.fillStyle = `rgba(0, 0, 0, 0.5)`;
	c.fillRect(p.position.x, p.position.y, p.width, p.height);
	c.restore();
}

function velocityVectorDraw(
	x: number,
	y: number,
	target_x: number,
	target_y: number,
	color: string
) {
	const c = gameCanvas.context;
	c.save();
	c.strokeStyle = color;
	c.lineWidth = 2;
	c.beginPath();
	c.moveTo(x, y);
	c.lineTo(target_x, target_y);
	c.stroke();
	c.restore();
}

function showFPS(fps: string) {
	const c = gameCanvas.context;
	c.save();
	c.font = '32px Arial';
	c.textAlign = 'center';

	const textX = CANVAS_WIDTH - 24;
	const textY = 32;

	c.fillStyle = 'rgba(44, 62, 80)';
	c.fillText(fps, textX, textY);

	c.restore();
}
