import { IEventConfig } from './lib/interfaces';
import AzureServiceBus from './azure/AzureServiceBus';
export default class EventManager {
    private static instance;
    serviceBus: AzureServiceBus | undefined;
    static getInstance(): EventManager;
    initialize(config: IEventConfig): (req: any, res: any, next: any) => any;
    static on(eventName: any, listener: any): void;
    emit(eventNames: string | string[], payload: any): void;
    close(): Promise<void>;
}
