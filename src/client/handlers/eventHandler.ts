import { RawPlayerInput, GameEvent } from '../common/types';
import { addInputToBuffer } from '../controllers/InputController';
import {
	getShowDebug,
	setShowDebug,
	getToggleReconciliation,
	setToggleReconciliation,
} from '../helpers/gameLogic';

const keys = {
	w: {
		pressed: false,
	},
	a: {
		pressed: false,
	},
	s: {
		pressed: false,
	},
	d: {
		pressed: false,
	},
	i: {
		pressed: false,
	},
	p: {
		pressed: false,
	},
};

// keyboard
export function handleKeydownEvent(event: KeyboardEvent): void {
	const input: RawPlayerInput = {};
	switch (event.code) {
		case 'KeyW':
			if (keys.w.pressed) {
				return;
			}
			keys.w.pressed = true;
			input.event = GameEvent.JUMP;
			break;
		case 'KeyA':
			if (keys.a.pressed) {
				return;
			}
			keys.a.pressed = true;
			input.event = GameEvent.RUN_LEFT;
			break;
		case 'KeyD':
			if (keys.d.pressed) {
				return;
			}
			keys.d.pressed = true;
			input.event = GameEvent.RUN_RIGHT;
			break;
		case 'KeyP':
			const currentDebug = getShowDebug();
			console.log(`show debug turned ${!currentDebug ? 'on' : 'off'}`);
			setShowDebug(!getShowDebug());
			break;
		case 'KeyR':
			const currentToggle = getToggleReconciliation();
			console.log(
				`reconciliation turned ${!currentToggle ? 'on' : 'off'}`
			);
			setToggleReconciliation(!currentToggle);
	}
	if (!input.event) return;
	addInputToBuffer(input);
}

export function handleKeyupEvent(event: KeyboardEvent): void {
	const input: RawPlayerInput = {};
	switch (event.code) {
		case 'KeyW':
			keys.w.pressed = false;
			break;
		case 'KeyA':
			keys.a.pressed = false;
			input.event = keys.d.pressed
				? GameEvent.RUN_RIGHT
				: GameEvent.STOPPING;
			break;
		case 'KeyD':
			keys.d.pressed = false;
			input.event = keys.a.pressed
				? GameEvent.RUN_LEFT
				: GameEvent.STOPPING;
			break;
	}
	if (!input.event) return;
	addInputToBuffer(input);
}

// mouse
export function handleMousedownEvent(event: MouseEvent): void {}

export function handleMouseupEvent(event: MouseEvent): void {}
