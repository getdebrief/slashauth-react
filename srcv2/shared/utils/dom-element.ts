import { uiErrorDOMElementDoesNotExist } from '../errors/slashauth-errors';

export const ensureDomElementExists = (element: HTMLElement) => {
  if (!element) {
    uiErrorDOMElementDoesNotExist();
  }
};
