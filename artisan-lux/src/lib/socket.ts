// Event emitter for order notifications
type OrderEventCallback = (data: unknown) => void;
const orderEventListeners: Set<OrderEventCallback> = new Set();

export function emitOrderEvent(eventType: string, data: unknown) {
  const payload = { type: eventType, data, timestamp: Date.now() };
  orderEventListeners.forEach((cb) => cb(payload));
}

export function addOrderEventListener(callback: OrderEventCallback) {
  orderEventListeners.add(callback);
  return () => orderEventListeners.delete(callback);
}
