import { ServiceBusClient } from '@azure/service-bus';
import { EmitterInterface, EventConfig } from './lib/interfaces';
/**
 * Azure Service bus
 */
export default class AzureServiceBus {
    serviceClient: ServiceBusClient;
    emittery: EmitterInterface;
    private topicName;
    connectionString: string;
    subscription: string[];
    constructor(config: EventConfig, emittery: EmitterInterface);
    /**
     * Send message
     */
    receiver(subscriptionName: string): void;
    /**
     * Receive message
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
