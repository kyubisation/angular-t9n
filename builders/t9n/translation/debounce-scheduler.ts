export class DebounceScheduler<T> {
  private readonly _scheduleMap = new Map<T, NodeJS.Timeout>();

  constructor(
    private readonly _action: (trigger: T) => Promise<void>,
    private readonly _debounceTime = 500
  ) {}

  schedule(trigger: T) {
    const entry = this._scheduleMap.get(trigger);
    if (entry !== undefined) {
      clearTimeout(entry);
    }

    this._scheduleMap.set(
      trigger,
      setTimeout(() => this._action(trigger), this._debounceTime)
    );
  }
}
