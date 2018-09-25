
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
      radius: 300
    },
    ball: {
      speed: {
        min: 2,
        max: 6,
      },
      radius: 5,
    },
    goal: {
      width: 30,
      height: 50,
    },
    player: {
      width: 20,
      height: 50,
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
      delay: 5000,
      timeout: 300000,
    },
  },
}

export default config