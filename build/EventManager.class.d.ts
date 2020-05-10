import { IEventConfig } from './lib/interfaces';
export default class EventManager {
    private static instance;
    private _emittery;
    private _serviceBus;
    private constructor();
    static getInstance(): EventManager;
    initialize(config: IEventConfig): void;
    on(eventName: any, listener: any): void;
    emit(eventNames: string | string[], payload: any): void;
    close(): Promise<void>;
}
