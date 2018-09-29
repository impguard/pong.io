export interface Player {
  composite: Matter.Composite
  basePosition: Matter.Vector
  baseAngle: number
  up: Matter.Vector
  right: Matter.Vector
  assigned: boolean
  paddleId: number
  lflipperId: number
  rflipperId: number
  velocity: Matter.Vector
  goal?: [Matter.Vector, Matter.Vector]
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
    [id: number]: Matter.Body
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
      rfx: number
      rfy: number
    }
  }
}

export interface Input {
  horizontal: number,
}

export interface Config {
  numPlayers: number,
  numBalls: number,
  arena: {
    radius: number,
  },
  post: {
    width: number,
    height: number,
  },
  player: {
    width: number,
    height: number,
    speed: number,
  },
  ball: {
    speed: {
      min: number,
      max: number,
    },
    radius: number,
    sides: number,
  },
  delta: number,
}