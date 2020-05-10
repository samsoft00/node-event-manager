"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line object-curly-newline
var service_bus_1 = require("@azure/service-bus");
var lodash_1 = require("lodash");
var fancy_log_1 = __importDefault(require("fancy-log"));
var EventResponse_1 = __importDefault(require("../lib/EventResponse"));
/**
 * Azure Service bus
 */
var AzureServiceBus = /** @class */ (function () {
    function AzureServiceBus(config, emittery) {
        var connectionString = config.connectionString, name = config.name, subscription = config.subscription;
        this.connectionString = connectionString;
        this.subscription = subscription;
        this.topicName = name;
        this.emittery = emittery;
        this.serviceClient = service_bus_1.ServiceBusClient.createFromConnectionString(connectionString);
    }
    /**
     * Receive message from both local and external
     */
    AzureServiceBus.prototype.receiver = function (subscriptionName) {
        var _this = this;
        var topicClient = this.serviceClient.createSubscriptionClient(this.topicName, subscriptionName);
        var receiver = topicClient.createReceiver(service_bus_1.ReceiveMode.peekLock);
        var processMessage = function (brokeredMessage) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.emittery.emit({
                    type: lodash_1.camelCase(subscriptionName),
                    result: new EventResponse_1.default({ response: brokeredMessage, error: undefined })
                });
                return [2 /*return*/];
            });
        }); };
        var processError = function (error) {
            _this.emittery.emit({
                type: lodash_1.camelCase(subscriptionName),
                result: new EventResponse_1.default({ response: undefined, error: error })
            });
        };
        receiver.registerMessageHandler(processMessage, processError, {
            autoComplete: false
        });
    };
    /**
     * Broadcast messages to local or external events
     */
    AzureServiceBus.prototype.sender = function (eventNames, payload) {
        var _this = this;
        var topicClient = this.serviceClient.createTopicClient(this.topicName);
        var sender = topicClient.createSender();
        var listOfEvents = Array.isArray(eventNames) ? eventNames : [eventNames];
        var azureExternalRequest = [];
        var sendEventToListener = function (eventName) {
            if (payload.source === 'azure') {
                azureExternalRequest.push(eventName);
            }
            else {
                Object.assign(payload, { label: eventName });
                _this.emittery.emit({
                    type: lodash_1.camelCase(eventName),
                    result: new EventResponse_1.default({ response: payload, error: undefined })
                });
            }
        };
        //
        listOfEvents.map(function (eventName) { return sendEventToListener(eventName); });
        if (azureExternalRequest.length > 0) {
            azureExternalRequest.map(function (eventName, index) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Object.assign(payload, {
                                body: __assign(__assign({}, payload.body), { source: payload.source }),
                                label: eventName
                            });
                            return [4 /*yield*/, sender.send(payload)];
                        case 1:
                            _a.sent();
                            fancy_log_1.default(eventName + " event emitted!");
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        //
    };
    /**
     * Retry dead Letter Queue
     */
    AzureServiceBus.prototype.processRetryDLQ = function (subscribeName) {
        var _this = this;
        var deadLetterQueueName = service_bus_1.TopicClient.getDeadLetterTopicPath(this.topicName, subscribeName);
        var queueClient = this.serviceClient.createQueueClient(deadLetterQueueName);
        var receiver = queueClient.createReceiver(service_bus_1.ReceiveMode.peekLock);
        var processMessage = function (brokeredMessage) { return __awaiter(_this, void 0, void 0, function () {
            var body, label;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = brokeredMessage.body, label = brokeredMessage.label;
                        this.sender(subscribeName, { body: body, label: label, source: 'azure' });
                        return [4 /*yield*/, brokeredMessage.complete()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        var processError = function (error) {
            console.log("RetryDLQ Error: " + error.message);
        };
        receiver.registerMessageHandler(processMessage, processError, {
            autoComplete: false
        });
    };
    /**
     * Close
     */
    AzureServiceBus.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.serviceClient.close()];
            });
        });
    };
    return AzureServiceBus;
}());
exports.default = AzureServiceBus;
