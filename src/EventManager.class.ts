/* eslint-disable array-callback-return */
import { ServiceBusClient, ReceiveMode, ServiceBusMessage } from '@azure/service-bus';
import { camelCase } from 'lodash';

import emittery from './lib/event';
import { EventConfig } from './lib/interfaces';
import EventResponse from './lib/EventResponse';

export default class EventManager {
  private static instance: EventManager;

  serviceClient: ServiceBusClient | undefined;

  topicName: string | undefined;

  connectionString: string | undefined;

  subscription: string[] | undefined;

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }

    return EventManager.instance;
  }

  public initialize(config: EventConfig) {
    const { name, subscription, connectionString } = config;

    this.topicName = name;
    this.connectionString = connectionString;
    this.subscription = subscription;
    let topicClient;

    this.serviceClient = ServiceBusClient.createFromConnectionString(connectionString);

    subscription.map((subscriptionName, index) => {
      if (!this.serviceClient || !this.topicName) {
        throw new Error('Error here');
      }

      topicClient = this.serviceClient.createSubscriptionClient(this.topicName, subscriptionName);

      const receiver = topicClient.createReceiver(ReceiveMode.peekLock);

      const processMessage = async (brokeredMessage: ServiceBusMessage) => {
        emittery.emit({
          type: camelCase(subscriptionName),
          result: new EventResponse({ response: brokeredMessage, error: undefined })
        });
      };

      const processError = (error: Error) => {
        emittery.emit({
          type: camelCase(subscriptionName),
          result: new EventResponse({ response: undefined, error })
        });
      };

      receiver.registerMessageHandler(processMessage, processError, {
        autoComplete: false
      });
    });

    topicClient.close().catch((err: any) => console.log(err));

    // return (req, res, next) => next();
  }

  public static on(eventName, listener) {
    emittery.addListener(camelCase(eventName), listener);
  }

  public emit(eventNames: string | string[], payload: any) {
    if (!this.serviceClient || !this.topicName) {
      throw new Error('Emit error');
    }
    const topicClient = this.serviceClient.createTopicClient(this.topicName);

    const sender = topicClient.createSender();

    const listOfEvents = Array.isArray(eventNames) ? eventNames : [eventNames];
    const azureExternalRequest: string[] = [];

    const sendEventToListener = (eventName: string) => {
      if (payload.source === 'azure') {
        azureExternalRequest.push(eventName);
      } else {
        Object.assign(payload, { label: eventName });

        emittery.emit({
          type: camelCase(eventName),
          result: new EventResponse({ response: payload, error: undefined })
        });
      }
    };

    listOfEvents.map((eventName: string) => sendEventToListener(eventName));

    if (azureExternalRequest.length > 0) {
      azureExternalRequest.map((eventName, index) => {
        Object.assign(payload, {
          body: { ...payload.body, source: payload.source },
          label: eventName
        });

        sender.send(payload).then(() => {
          console.log('Event Emitted');
        });
      });
    }

    topicClient
      .close()
      .then(() => sender.close())
      .catch((err: any) => console.log(err));
  }

  async close() {
    if (this.serviceClient) {
      await this.serviceClient.close();
    }
  }
}
