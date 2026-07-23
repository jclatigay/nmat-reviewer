import { TIMER_WARNING_SECONDS } from '../config.js';
import { updateTimer } from './sessionStore.js';

export function createTimer(initialSeconds, onTick, onExpire) {
  let remaining = initialSeconds;
  let intervalId = null;

  function tick() {
    remaining -= 1;
    onTick(remaining);

    if (remaining <= 0) {
      stop();
      onExpire();
    } else {
      updateTimer(remaining);
    }
  }

  return {
    start(session) {
      remaining = session.remainingSeconds ?? initialSeconds;
      stop();
      intervalId = setInterval(tick, 1000);
    },
    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    getRemaining() {
      return remaining;
    },
    isWarning() {
      return remaining <= TIMER_WARNING_SECONDS && remaining > 0;
    },
  };
}

export function createElapsedTimer(onTick) {
  let elapsed = 0;
  let intervalId = null;

  return {
    start(fromSeconds = 0) {
      elapsed = fromSeconds;
      stop();
      intervalId = setInterval(() => {
        elapsed += 1;
        onTick(elapsed);
      }, 1000);
    },
    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
