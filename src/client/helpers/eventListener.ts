import {
	handleKeydownEvent,
	handleKeyupEvent,
	handleMousedownEvent,
	handleMouseupEvent,
} from '../handlers/eventHandler';

export function initializeEventListeners() {
	window.addEventListener('keydown', (event: KeyboardEvent) => {
		handleKeydownEvent(event);
	});

	window.addEventListener('keyup', (event: KeyboardEvent) => {
		handleKeyupEvent(event);
	});

	window.addEventListener('mousedown', (event: MouseEvent) => {
		handleMousedownEvent(event);
	});

	window.addEventListener('mouseup', (event: MouseEvent) => {
		handleMouseupEvent(event);
	});

	console.log('Event listeners initialized');
}
