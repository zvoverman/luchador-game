// Import necessary modules and functions
import { GameCanvas } from '../components/GameCanvas';
import {
	addPlayer,
	getBackendPlayer,
	getBackendPlayers,
	getBackendTime,
	getPlayer,
	getPlayers,
} from '../controllers/PlayerController';
import {
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	TIME_SYNC_INTERVAL,
	GRAVITY_CONSTANT,
	SPEED,
	JUMP_FORCE,
	GROUND_FRICTION,
} from '../common/constants';
import {
	addInputToBuffer,
	consumeInputFromQueue,
	eraseInputQueue,
	getInputQueue,
	getInputQueueLength,
	peekInputQueue,
	processRawInputs,
} from '../controllers/InputController';
import { Player } from '../components/Player';
import { socket } from './socket';
import { BackendPlayerState, GameEvent } from '../common/types';
import { time } from 'console';

let showDebug = false;
let gameCanvas: GameCanvas;
let lastRenderTime: number = 0;
let timeOffset: number = 0;

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

// FIXME: updateGameState is changing backendPlayers
// EDIT: I think I fixed this... using the spread operator to assign a shallow copy did the trick (e.g. player.velocity = { ...backendPlayer.velocity})
export function updateGameState(
	deltaTime: number,
	currentTimestamp: number
): void {
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
				{ ...backendPlayer.position },
				backendPlayer.playerColor
			);
			addPlayer(id, newPlayer);
		} else {
			if (id === socket.id) {
				// ensure copies are assigned
				player.position = { ...backendPlayer.position };
				player.velocity = { ...backendPlayer.velocity };

				if (toggleServerReconciliation) {
					serverReconciliation(
						player,
						backendPlayer,
						currentTimestamp
					);
				} else {
					eraseInputQueue();
				}
			} else {
				// ensure copies are assigned
				player.position = { ...backendPlayer.position };
				player.velocity = { ...backendPlayer.velocity };
			}
		}
	}
}

function serverReconciliation(
	player: Player,
	backEndPlayer: BackendPlayerState,
	currentTimestamp: number
) {
	let timestep: number = 0;
	let friction: number = 0;

	// Loop through input array
	const inputQueue = getInputQueue();
	for (let i = 0; i < getInputQueueLength(); i++) {
		const input = inputQueue[i];

		// t2 - t1 = timestep
		// <now or next input> - <current input> = <time spent in this state so far>
		if (input.timestamp < backEndPlayer.timestamp) {
			// backend player has completely processed this input
			// remove it
			consumeInputFromQueue();
		} else if (input.timestamp === backEndPlayer.timestamp) {
			// backend player is in this state
			// continue from last authoritative position
			const start = input.timestamp + backEndPlayer.timeSinceInput * 1000;
			const now =
				inputQueue[i + 1] === undefined
					? currentTimestamp
					: inputQueue[i + 1].timestamp;
			timestep = (now - start) / 1000.0;

			if (timestep < 0) {
				timestep = 0;
			}

			/*  Check if player is not moving - must set timestep to 0 to avoid innacuracies in x-axis movement approximations  */
			if (player.velocity.x == 0) {
				movePlayerVertically(player, timestep);
				timestep = 0.0;
			}

			switch (input.event) {
				case GameEvent.STOPPING:
					/*  Get Direction of Friction  */
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
			// backend player has not begun processing this input
			// apply it from state start
			const start = input.timestamp;
			const now =
				// will be undefined but NOT null
				inputQueue[i + 1] === undefined
					? currentTimestamp
					: inputQueue[i + 1].timestamp;

			timestep = (now - start) / 1000.0;

			if (timestep < 0) {
				timestep = 0;
			}

			switch (input.event) {
				case GameEvent.STOPPING:
					/*  Get Direction of Friction  */
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

function getDistanceFromTimespan(
	velocity: number,
	acceleration: number,
	timestep: number
): number {
	return velocity * timestep + (acceleration / 2) * timestep * timestep;
}

function movePlayer(player: Player, timestep: number, friction: number) {
	// move x
	console.log('BEFORE x: ' + player.position.x);

	const initialSpeed = player.velocity.x;
	const initialPosition = player.position.x;
	player.position.x +=
		timestep * (player.velocity.x + (timestep * friction) / 2);
	player.velocity.x += timestep * friction;

	checkFriction(player, initialPosition, initialSpeed, timestep, friction);
	console.log('AFTER x: ' + player.position.x);

	// move y
	player.position.y +=
		timestep * (player.velocity.y + (timestep * GRAVITY_CONSTANT) / 2);
	player.velocity.y += timestep * GRAVITY_CONSTANT;
	checkGravity(player);
}

function movePlayerVertically(player: Player, timestep: number) {
	player.position.y +=
		timestep * (player.velocity.y + (timestep * GRAVITY_CONSTANT) / 2);
	player.velocity.y += timestep * GRAVITY_CONSTANT;
	checkGravity(player);
}

function checkFriction(
	player: Player,
	initialPosition: number,
	initialSpeed: number,
	timestep: number,
	friction: number
) {
	const speed = player.velocity.x;

	/*  Check if Friction Should be Accounted For  */
	if (friction == 0) return;

	/*  Check if the Player has Stopped  */
	if (!isFrictionOver(initialSpeed, speed)) return;

	/*  Get Duration of Friction  */
	const frictionDuration = -initialSpeed / friction;

	/*  Calculate Distance Traveled  */
	const distanceTraveled =
		timestep > frictionDuration
			? getDistanceFromTimespan(initialSpeed, friction, frictionDuration)
			: getDistanceFromTimespan(initialSpeed, friction, timestep);

	// console.log('here');
	player.position.x = initialPosition + distanceTraveled;
	player.velocity.x = 0;
}

function checkGravity(player: Player) {
	if (!player) return;
	if (player.position.y + player.height >= CANVAS_HEIGHT) {
		player.velocity.y = 0;
		player.position.y = CANVAS_HEIGHT - player.height;
	}
}

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

export function timeSync(serverTime: number) {
	const clientTime = Date.now();
	const roundTripTime = clientTime - serverTime;
	timeOffset = serverTime + roundTripTime / 2.0 - clientTime;
}

function render(currentTime: number): void {
	const deltaTime = (currentTime - lastRenderTime) / 1000;
	lastRenderTime = currentTime;

	updateGameState(deltaTime, currentTime);

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
