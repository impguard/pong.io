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

export interface Base {
  id: number
  x: number
  y: number
  width: number
  height: number
  angle: number
  playerId: number
}

export interface Game {
  bases: Base[]
  walls: Wall[]
  paddles: Paddle[]
}

export interface PartialGame {
  paddles: Paddle[]
}