import { ServiceBusMessage } from '@azure/service-bus';

export default class EventResponse {
  private type: string | any;

  private error: Error | undefined;

  private source: string | undefined;

  private body: any;

  private sourceRef: ServiceBusMessage | undefined;

  constructor(payload: Partial<{ response: ServiceBusMessage; error: Error }>) {
    const { response, error } = payload;

    if (error) {
      this.error = error;
    } else if (response) {
      const { body, label } = response;

      this.type = label;
      this.source = body.source || 'node';
      this.body = body;
      this.sourceRef = response;
    }
  }

  getError() {
    return this.error;
  }

  getType() {
    return this.type;
  }

  getSource() {
    return this.source;
  }

  getBody() {
    return this.body;
  }

  async complete() {
    if (this.source !== 'node') {
      await this.sourceRef?.complete();
    }
  }
}
