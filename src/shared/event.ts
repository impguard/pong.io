import { EventEmitter } from 'events'

declare interface IEvent extends EventEmitter {
  on(event: 'gameOver', listener: (winner: number) => void)

  emit(event: 'gameOver', winner: number)
}

const event: IEvent = new EventEmitter()

export default event
