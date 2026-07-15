/**
 * Holds an in-flight or completed prefetch so the next exercise
 * can start generating right after the current one is finished.
 */
export class PrefetchSlot<T> {
  private promise: Promise<T> | null = null
  private value: T | null = null

  start(factory: () => Promise<T>) {
    if (this.promise) return
    this.promise = factory()
      .then((v) => {
        this.value = v
        return v
      })
      .catch((e) => {
        this.promise = null
        throw e
      })
  }

  async take(factory: () => Promise<T>): Promise<T> {
    if (this.value !== null) {
      const v = this.value
      this.clear()
      return v
    }
    if (this.promise) {
      try {
        const v = await this.promise
        this.clear()
        return v
      } catch {
        this.clear()
      }
    }
    return factory()
  }

  clear() {
    this.promise = null
    this.value = null
  }
}
