declare const ServiceEventEmitter: {
    emit(event: any): void;
    addListener(eventType: any, listener: any): void;
};
export default ServiceEventEmitter;
