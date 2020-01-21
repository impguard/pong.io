export interface Paddle {
  id: number
  x: number
  y: number
  width: number
  height: number
  angle: number
}

export interface Wall {
  id: number
  x: number
  y: number
  width: number
  height: number
  angle: number
}

export interface Ball {
  id: number
  x: number
  y: number
  radius: number
  vx: number
  vy: number
}

export interface Base {
  id: number
  x: number
  y: number
  width: number
  height: number
  angle: number
}

export interface Game {
  bases: Base[]
  walls: Wall[]
  paddles: Paddle[]
  balls: Ball[]
}

export interface PartialGame {
  paddles: Paddle[]
  balls: Ball[]
}

export interface Config {
  numPlayers: number
  numBalls: number
  ball: {
    radius: number
    maxSpeed: number
  }
  paddle: {
    width: number
    height: number
  }
  base: {
    gap: number
    offset: number
    height: number
  }
  wall: {
    width: number
    height: number
  }
  map: {
    scale: number
    gap: number
  }
}