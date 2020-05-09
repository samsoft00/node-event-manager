"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eventemitter2_1 = require("eventemitter2");
/**
 * @class EngineEvents
 * @developer Oyewole Abayomi Samuel
 */
var emittery = new eventemitter2_1.EventEmitter2();
var ServiceEventEmitter = {
    emit: function (event) {
        emittery.emit(event.type, event.result);
    },
    addListener: function (eventType, listener) {
        emittery.addListener(eventType, listener);
    }
};
exports.default = ServiceEventEmitter;
