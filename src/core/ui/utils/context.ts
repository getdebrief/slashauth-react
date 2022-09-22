import { contextDoesNotExist } from '../../../shared/errors/slashauth-errors';

export function assertContextExists(
  contextVal: unknown,
  providerName: string
): asserts contextVal {
  if (!contextVal) {
    contextDoesNotExist(providerName);
  }
}
