import { ServiceBusMessage } from '@azure/service-bus';
export default class EventResponse {
    private type;
    private error;
    private source;
    private body;
    private sourceRef;
    constructor(payload: Partial<{
        response: ServiceBusMessage;
        error: Error;
    }>);
    getError(): Error | undefined;
    getType(): any;
    getSource(): string | undefined;
    getBody(): any;
    complete(): Promise<void>;
}
