import * as io from 'socket.io-client'

const submitElem = document.getElementById('submit')
const hostElem = <HTMLInputElement> document.getElementById('host')
const portElem = <HTMLInputElement> document.getElementById('port')
const outputElem = <HTMLTextAreaElement> document.getElementById('output')

const log = (data) => {
  outputElem.value += data + '\n'
}

let socket: SocketIOClient.Socket

submitElem.addEventListener('click', () => {
  const host = hostElem.value
  const port = portElem.value

  if (socket) {
    socket.disconnect()
  }

  socket = io(`${host}:${port}`)
  socket.on('time', log)
})
