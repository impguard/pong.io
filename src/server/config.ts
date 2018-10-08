import * as Game from '../shared/game'

interface IConfig {
  app: {
    network: {
      delta: number,
    }
    match: {
      playersRequired: number
      startDelay: number,
      finishDelay: number,
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
        min: 5,
        max: 10,
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
      health: 10,
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
        angle: -50,
      },
      swing: {
        speed: 0.7,
        angle: 65,
      },
      reset: {
        speed: 0.3,
      },
    },
    cover: {
      width: 150,
      height: 15,
      offset: 30,
    },
    numBalls: 7,
    numPlayers: 10,
    delta: 16,
  },
  app: {
    network: {
      delta: 100,
    },
    match: {
      playersRequired: 1,
      startDelay: 5000,
      finishDelay: 5000,
    },
  },
}

export default config
