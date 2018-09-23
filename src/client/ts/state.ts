export interface App {
  socket: SocketIOClient.Socket,
  server: {
    host: string,
    port: string,
  }
  name: string,
  started: boolean,
  accepted: boolean,

  simulation: {
    engine: Matter.Engine,
    render: Matter.Render,
  }
}