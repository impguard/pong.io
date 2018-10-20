export default class CBuffer<T> {
  private array: T[]
  private end: number

  constructor(readonly size: number) {
    this.array = new Array(size)
    this.size = size
    this.end = 0
  }

  public set(index: number, item: T) {
    const bufferIndex = index % this.size

    this.array[bufferIndex] = item
  }

  public get(index: number): T {
    const bufferIndex = index % this.size

    return this.array[bufferIndex]
  }

  public *range(begin: number, end: number): IterableIterator<T> {
    let curr = begin

    while (curr !== end) {
      const bufferIndex = curr % this.size

      yield this.array[bufferIndex]

      curr += 1
    }
  }
}
