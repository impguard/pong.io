import * as Game from '../shared/game'

interface IConfig {
  app: {
    network: {
      delta: number,
    }
    match: {
      playersRequired: number
      delay: number,
    },
  }
  game: Game.IConfig
}

const config: IConfig = {
  game: {
    arena: {
      radius: 300,
    },
    ball: {
      speed: {
        min: 1,
        max: 4,
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
    numBalls: 10,
    numPlayers: 10,
    delta: 16,
  },
  app: {
    network: {
      delta: 100,
    },
    match: {
      playersRequired: 2,
      delay: 5000,
    },
  },
}

export default config
