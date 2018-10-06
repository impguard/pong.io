import * as Matter from 'matter-js'

export interface Player {
  composite: Matter.Composite
  basePosition: Matter.Vector
  baseAngle: number
  up: Matter.Vector
  right: Matter.Vector
  assigned: boolean
  paddle: Matter.Body
  lflipper: Flipper
  rflipper: Flipper
  goal?: [Matter.Vector, Matter.Vector]
  health: number
}

export enum FlipperType { RIGHT, LEFT }

export enum FlipperState { CHARGE, SWING, RESET, READY }

export interface Flipper {
  body: Matter.Body
  type: FlipperType
  state: FlipperState
  basePosition: Matter.Vector
  baseAngle: number
}

export interface State {
  engine: Matter.Engine
  config: Config
  runner: {
    id?: any
    beforeTick: Array<() => void>,
  },
  players: {
    [id: number]: Player,
  }
  balls: {
    [id: number]: Matter.Body,
  },
  paddles: {
    [id: number]: Matter.Body,
  },
  flippers: {
    [id: number]: Flipper,
  }
  posts: {
    [id: number]: Matter.Body,
  }
}

export interface InitialSample {
  players: {
    [id: number]: {
      x: number
      y: number
      a: number
      p: number
      lf: number
      rf: number,
    },
  },
  posts: {
    [id: number]: {
      x: number
      y: number
      a: number,
    },
  }
}

export interface FlipperSample {
  x: number
  y: number
  vx: number
  vy: number
  a: number
  va: number
  s: FlipperState
}

export interface Sample {
  balls: {
    [id: number]: {
      x: number
      y: number
      vx: number
      vy: number,
    },
  }
  players: {
    [id: number]: {
      p: {
        x: number
        y: number
        vx: number
        vy: number,
      }
      lf: FlipperSample
      rf: FlipperSample,
    },
  }
}

export interface Goal {
  id: number
  health: number
}

export interface Input {
  horizontal: number
  lswing: boolean
  rswing: boolean
}

export interface Config {
  numPlayers: number
  numBalls: number
  arena: {
    radius: number,
  },
  post: {
    width: number
    height: number,
  }
  player: {
    speed: number
    health: number,
  }
  paddle: {
    width: number
    height: number,
  }
  flipper: {
    width: number
    height: number
    spacing: number
    charge: {
      speed: number
      angle: number,
    }
    swing: {
      speed: number
      angle: number,
    }
    reset: {
      speed: number,
    },
  }
  ball: {
    speed: {
      min: number
      max: number,
    }
    damage: number
    radius: number
    sides: number,
  }
  delta: number
}
