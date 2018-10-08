import * as Matter from 'matter-js'

export interface IPlayer {
  composite: Matter.Composite,
  basePosition: Matter.Vector,
  baseAngle: number,
  up: Matter.Vector,
  right: Matter.Vector,
  assigned: boolean,
  paddle: Matter.Body,
  lflipper: IFlipper,
  rflipper: IFlipper,
  goal?: [Matter.Vector, Matter.Vector],
  health: number,
}

export enum IFlipperType { RIGHT, LEFT }

export enum IFlipperState { CHARGE, SWING, RESET, READY }

export interface IFlipper {
  body: Matter.Body,
  type: IFlipperType,
  state: IFlipperState,
  basePosition: Matter.Vector,
  baseAngle: number,
}

export interface IState {
  engine: Matter.Engine,
  config: IConfig,
  runner: {
    id?: any,
  },
  players: {
    [id: number]: IPlayer,
  }
  balls: {
    [id: number]: Matter.Body,
  },
  paddles: {
    [id: number]: Matter.Body,
  },
  flippers: {
    [id: number]: IFlipper,
  }
  posts: {
    [id: number]: Matter.Body,
  }
  covers: {
    [id: number]: Matter.Body,
  }
}

export interface ISampleInitial {
  players: {
    [id: number]: {
      x: number,
      y: number,
      a: number,
      p: number,
      lf: number,
      rf: number,
    },
  },
  posts: {
    [id: number]: {
      x: number,
      y: number,
      a: number,
    },
  },
}

export interface ISampleFlipper {
  x: number,
  y: number,
  vx: number,
  vy: number,
  a: number,
  va: number,
  s: IFlipperState,
}

export interface ISample {
  balls: {
    [id: number]: {
      x: number,
      y: number,
      vx: number,
      vy: number,
    },
  },
  players: {
    [id: number]: {
      p: {
        x: number,
        y: number,
        vx: number,
        vy: number,
      },
      lf: ISampleFlipper,
      rf: ISampleFlipper,
      h: number,
    },
  },
  covers: {
    [id: number]: {
      x: number,
      y: number,
      a: number,
    },
  },
}

export interface IInput {
  horizontal: number,
  lswing: boolean,
  rswing: boolean,
}

export interface IConfig {
  numPlayers: number,
  numBalls: number,
  arena: {
    radius: number,
  },
  post: {
    width: number,
    height: number,
  },
  cover: {
    width: number,
    height: number,
    offset: number,
  },
  player: {
    speed: number,
    health: number,
  },
  paddle: {
    width: number,
    height: number,
  },
  flipper: {
    width: number,
    height: number,
    spacing: number,
    charge: {
      speed: number,
      angle: number,
    },
    swing: {
      speed: number,
      angle: number,
    },
    reset: {
      speed: number,
    },
  },
  ball: {
    speed: {
      min: number,
      max: number,
    },
    damage: number,
    radius: number,
    sides: number,
  },
  delta: number,
}
