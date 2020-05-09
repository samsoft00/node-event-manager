import { EventConfig } from './lib/interfaces';
import AzureServiceBus from './AzureServiceBus';
export default class EventManager {
    private static instance;
    serviceBus: AzureServiceBus | undefined;
    static getInstance(): EventManager;
    initialize(config: EventConfig): (req: any, res: any, next: any) => any;
    static on(eventName: any, listener: any): void;
    emit(eventNames: string | string[], payload: any): void;
    close(): Promise<void>;
}
