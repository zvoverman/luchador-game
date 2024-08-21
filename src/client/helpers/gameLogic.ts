// Import necessary modules and functions
import { GameCanvas } from '../components/GameCanvas';
import {
	addPlayer,
	getBackendPlayer,
	getBackendPlayers,
	getPlayer,
	getPlayers,
} from '../controllers/PlayerController';
import {
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	TIME_SYNC_INTERVAL,
} from '../common/constants';
import { processRawInputs } from '../controllers/InputController';
import { Player } from '../components/Player';
import { socket } from './socket';
import { BackendPlayerState } from '../common/types';

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

export function updateGameState(
	deltaTime: number,
	currentTimestamp: number
): void {
	// process raw inputs
	processRawInputs(currentTimestamp);
	// update players
	updatePlayers(currentTimestamp);
}

export function updatePlayers(currentTimestamp: number): void {
	const backendPlayers = getBackendPlayers();
	for (const id in backendPlayers) {
		const backendPlayer = backendPlayers[id];

		const player = getPlayer(id);
		if (!player) {
			const newPlayer = new Player(
				{
					x: backendPlayer.position.x,
					y: backendPlayer.position.y,
				},
				backendPlayer.playerColor
			);
			addPlayer(id, newPlayer);
		} else {
			if (id === socket.id) {
				player.position = backendPlayer.position;
				player.velocity = backendPlayer.velocity;
			} else {
				player.position = backendPlayer.position;
				player.velocity = backendPlayer.velocity;
			}
		}
	}
}

export function timeSync(serverTime: number) {
	const clientTime = Date.now();
	const roundTripTime = clientTime - serverTime;
	timeOffset = serverTime + roundTripTime / 2.0 - clientTime;
	console.log(timeOffset);
}

function render(currentTime: number): void {
	const deltaTime = (currentTime - lastRenderTime) / 1000;
	lastRenderTime = currentTime;

	updateGameState(deltaTime, currentTime);

	gameCanvas.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	const players = getPlayers();
	for (const id in players) {
		const player = players[id];
		player.draw(gameCanvas.context);

		if (showDebug) {
			const backendPlayer = getBackendPlayer(id);
			debugDraw(backendPlayer);
		}
	}

	requestAnimationFrame(render);
}

export function setShowDebug(flag: boolean): void {
	showDebug = flag;
}

function debugDraw(player: BackendPlayerState | null) {
	if (!player) return;
}
