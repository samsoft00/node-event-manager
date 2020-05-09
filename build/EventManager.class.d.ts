import { ServiceBusClient } from '@azure/service-bus';
import { EventConfig } from './lib/interfaces';
export default class EventManager {
    private static instance;
    serviceClient: ServiceBusClient | undefined;
    topicName: string | undefined;
    connectionString: string | undefined;
    subscription: string[] | undefined;
    static getInstance(): EventManager;
    initialize(config: EventConfig): void;
    static on(eventName: any, listener: any): void;
    emit(eventNames: string | string[], payload: any): void;
    close(): Promise<void>;
}
