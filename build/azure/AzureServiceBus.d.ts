import { ServiceBusClient } from '@azure/service-bus';
import { IEmitterInterface, IEventConfig } from '../lib/interfaces';
/**
 * Azure Service bus
 */
export default class AzureServiceBus {
    serviceClient: ServiceBusClient;
    emittery: IEmitterInterface;
    private topicName;
    connectionString: string;
    subscription: string[];
    constructor(config: IEventConfig, emittery: IEmitterInterface);
    /**
     * Receive message from both local and external
     */
    receiver(subscriptionName: string): void;
    /**
     * Broadcast messages to local or external events
     */
    sender(eventNames: string | string[], payload: any): void;
    /**
     * Retry dead Letter Queue
     */
    processRetryDLQ(subscribeName: any): void;
    /**
     * Close
     */
    close(): Promise<any>;
}
