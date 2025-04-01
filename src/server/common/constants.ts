/* global backend game constants */
export const SPEED = 700;
export const JUMP_FORCE = 1200;
export const GRAVITY_CONSTANT = 2800;
export const GROUND_FRICTION = 0.3;
export const AIR_FRICTION = 0.01;

export const PLAYER_WIDTH = 64;
export const PLAYER_HEIGHT = 64;

export const MAX_HEALTH = 3;

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 576;

/* general constants */
export const FAKE_LAG = process.env.FAKE_LAG || false;
export const LATENCY = 1200; // ms

export const MAX_CLIENT_CAPACITY = 4;
