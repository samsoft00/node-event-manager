// eslint-disable-next-line object-curly-newline
import { ServiceBusClient, ReceiveMode, ServiceBusMessage, TopicClient } from '@azure/service-bus';
import { camelCase } from 'lodash';
import log from 'fancy-log';

import EventResponse from '../lib/EventResponse';
import { IEmitterInterface, IEventConfig } from '../lib/interfaces';

/**
 * Azure Service bus
 */
export default class AzureServiceBus {
  serviceClient: ServiceBusClient;

  public emittery: IEmitterInterface;

  private topicName: string;

  connectionString: string;

  subscription: string[];

  constructor(config: IEventConfig, emittery: IEmitterInterface) {
    const { connectionString, name, subscription } = config;

    this.connectionString = connectionString;
    this.subscription = subscription;
    this.topicName = name;

    this.emittery = emittery;
    this.serviceClient = ServiceBusClient.createFromConnectionString(connectionString);
  }

  /**
   * Receive message from both local and external
   */
  public receiver(subscriptionName: string) {
    const topicClient = this.serviceClient.createSubscriptionClient(
      this.topicName,
      subscriptionName
    );

    const receiver = topicClient.createReceiver(ReceiveMode.peekLock);

    const processMessage = async (brokeredMessage: ServiceBusMessage) => {
      this.emittery.emit({
        type: camelCase(subscriptionName),
        result: new EventResponse({ response: brokeredMessage, error: undefined })
      });
    };

    const processError = (error: Error) => {
      this.emittery.emit({
        type: camelCase(subscriptionName),
        result: new EventResponse({ response: undefined, error })
      });
    };

    receiver.registerMessageHandler(processMessage, processError, {
      autoComplete: false
    });
  }

  /**
   * Broadcast messages to local or external events
   */
  public sender(eventNames: string | string[], payload: any) {
    const topicClient = this.serviceClient.createTopicClient(this.topicName);

    const sender = topicClient.createSender();

    const listOfEvents = Array.isArray(eventNames) ? eventNames : [eventNames];
    const azureExternalRequest: string[] = [];

    const sendEventToListener = (eventName: string) => {
      if (payload.source === 'azure') {
        azureExternalRequest.push(eventName);
      } else {
        Object.assign(payload, { label: eventName });

        this.emittery.emit({
          type: camelCase(eventName),
          result: new EventResponse({ response: payload, error: undefined })
        });
      }
    };

    //
    listOfEvents.map((eventName: string) => sendEventToListener(eventName));

    if (azureExternalRequest.length > 0) {
      azureExternalRequest.map(async (eventName, index) => {
        Object.assign(payload, {
          body: { ...payload.body, source: payload.source },
          label: eventName
        });

        await sender.send(payload);

        log(`${eventName} event emitted!`);
      });
    }
    //
  }

  /**
   * Retry dead Letter Queue
   */
  public processRetryDLQ(subscribeName) {
    const deadLetterQueueName = TopicClient.getDeadLetterTopicPath(this.topicName, subscribeName);

    const queueClient = this.serviceClient.createQueueClient(deadLetterQueueName);
    const receiver = queueClient.createReceiver(ReceiveMode.peekLock);

    const processMessage = async (brokeredMessage: ServiceBusMessage) => {
      const { body, label } = brokeredMessage;

      this.sender(subscribeName, { body, label, source: 'azure' });
      await brokeredMessage.complete();
    };

    const processError = (error: Error) => {
      console.log(`RetryDLQ Error: ${error.message}`);
    };

    receiver.registerMessageHandler(processMessage, processError, {
      autoComplete: false
    });
  }

  /**
   * Close
   */
  public async close() {
    return this.serviceClient.close();
  }
}
