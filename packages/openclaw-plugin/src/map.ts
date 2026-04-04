export class MapWithPop<K, V> extends Map<K, V> {
  pop(key: K): V | undefined {
    const value = this.get(key);
    if (value !== undefined) {
      this.delete(key);
    }
    return value;
  }
}
