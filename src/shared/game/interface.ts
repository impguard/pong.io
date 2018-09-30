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
  velocity: Matter.Vector
  goal?: [Matter.Vector, Matter.Vector]
}

export enum FlipperType { RIGHT, LEFT }

export enum FlipperState { CHARGE, SWING, RESET, READY }

export interface Flipper {
  body: Matter.Body
  type: FlipperType
  state: FlipperState
  baseAngle: number
}

export interface State {
  engine: Matter.Engine,
  config: Config
  runner: {
    id?: any,
    beforeTick: (() => void)[],
  },
  players: {
    [id: number]: Player
  }
  balls: {
    [id: number]: Matter.Body
  },
  paddles: {
    [id: number]: Matter.Body
  },
  flippers: {
    [id: number]: Flipper
  }
  posts: {
    [id: number]: Matter.Body
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
      rf: number
    }
  },
  posts: {
    [id: number]: {
      x: number
      y: number
      a: number
    }
  }
}

export interface Sample {
  balls: {
    [id: number]: {
      x: number
      y: number
      vx: number
      vy: number
    }
  }
  players: {
    [id: number]: {
      vx: number
      vy: number
      px: number
      py: number
      lfx: number
      lfy: number
      lfa: number
      lfs: FlipperState
      rfx: number
      rfy: number
      rfa: number
      rfs: FlipperState
    }
  }
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
    radius: number
  },
  post: {
    width: number
    height: number
  }
  player: {
    speed: number
  }
  paddle: {
    width: number
    height: number
  }
  flipper: {
    width: number
    height: number
    spacing: number
    charge: {
      speed: number
      angle: number
    }
    swing: {
      speed: number
      angle: number
    }
    reset: {
      speed: number
    }
  }
  ball: {
    speed: {
      min: number
      max: number
    }
    radius: number
    sides: number
  }
  delta: number
}