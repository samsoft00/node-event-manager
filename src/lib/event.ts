import { EventEmitter2 as EventEmitter } from 'eventemitter2';

/**
 * @class EngineEvents
 * @developer Oyewole Abayomi Samuel
 */
const emittery = new EventEmitter();

const ServiceEventEmitter = {
  emit(event) {
    emittery.emit(event.type, event.result);
  },
  addListener(eventType, listener) {
    emittery.addListener(eventType, listener);
  }
};

export default ServiceEventEmitter;
