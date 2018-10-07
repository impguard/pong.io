import { EventEmitter } from 'events'

declare interface IEvent extends EventEmitter {
  on(event: 'beforeTick', listener: () => void)
  on(event: 'gameOver', listener: (winner: number) => void)

  emit(event: 'beforeTick')
  emit(event: 'gameOver', winner: number)
}

const event: IEvent = new EventEmitter()

export default event
