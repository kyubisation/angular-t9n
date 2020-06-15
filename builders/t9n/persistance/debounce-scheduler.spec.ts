import { DebounceScheduler } from './debounce-scheduler';

jest.useFakeTimers();

describe('DebounceScheduler', () => {
  it('should execute the action', () => {
    const trigger = 'trigger';
    const action = jest.fn((t) => expect(t).toEqual(trigger));
    const scheduler = new DebounceScheduler<string>(action, 0);
    scheduler.schedule(trigger);
    expect(action).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(action).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);
  });

  it('should reset the action timer on new schedule', () => {
    const action = jest.fn();
    const trigger = 'trigger';
    const scheduler = new DebounceScheduler<string>(action, 500);
    scheduler.schedule(trigger);
    expect(action).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1200);
    expect(action).toHaveBeenCalledTimes(1);
    scheduler.schedule(trigger);
    jest.advanceTimersByTime(300);
    expect(action).toHaveBeenCalledTimes(1);
    scheduler.schedule(trigger);
    jest.advanceTimersByTime(300);
    expect(action).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(300);
    expect(action).toHaveBeenCalledTimes(2);
  });
});
