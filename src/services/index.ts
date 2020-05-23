import { ServiceType } from '../lib/interfaces';
import AzureServiceBus from './AzureServiceBus';

export default (service, ...payload) => {
  if (service === ServiceType.AZURE) {
    return new AzureServiceBus(payload[0], payload[1]);
  }
  throw new Error('Unsupported service');
};
