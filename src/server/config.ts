
import * as Game from '../shared/game'


interface Config {
  app: {
    network: {
      delta: number,
    }
    match: {
      delay: number,
      timeout: number,
    },
  },
  game: Game.Config,
}


const config: Config = {
  game: {
    arena: {
      radius: 300,
    },
    ball: {
      speed: {
        min: 1,
        max: 3,
      },
      damage: 1,
      radius: 5,
      sides: 50,
    },
    post: {
      width: 80,
      height: 15,
    },
    player: {
      speed: 0.15,
      health: 3,
    },
    paddle: {
      width: 15,
      height: 10,
    },
    flipper: {
      width: 30,
      height: 5,
      spacing: 4,
      charge: {
        speed: 0.3,
        angle: -45,
      },
      swing: {
        speed: 0.6,
        angle: 45,
      },
      reset: {
        speed: 0.7,
      },
    },
    numBalls: 1,
    numPlayers: 10,
    delta: 16,
  },
  app: {
    network: {
      delta: 100,
    },
    match: {
      delay: 5000,
      timeout: 300000,
    },
  },
}

export default config