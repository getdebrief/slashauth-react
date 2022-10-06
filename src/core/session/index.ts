import EventEmitter from 'eventemitter3';

export type Session = {
  id: string;
};

export class SessionManager {
  #HANDLED_EVENT_TYPES = ['initialized', 'get_session_response'];

  #session: Session | null;
  #iframe: HTMLIFrameElement | null;
  #origin: string;
  #iframeInitialized: boolean;
  #eventEmitter: EventEmitter;

  constructor(origin: string) {
    this.#origin = origin;
    this.#session = null;
    this.#iframe = null;

    this.#iframeInitialized = false;
    this.#eventEmitter = new EventEmitter();
  }

  async getSession(): Promise<Session | null> {
    if (!this.#iframeInitialized) {
      return Promise.resolve(null);
    }
    if (this.#session) {
      return Promise.resolve(this.#session);
    }
    return new Promise<Session | null>((resolve, reject) => {
      const onEvent = () => {
        this.#eventEmitter.off('get_session_response', onEvent);
        resolve(this.#session);
      };
      this.#eventEmitter.on('get_session_response', onEvent);
      const iframeElement = document.getElementById('foo') as HTMLIFrameElement;
      iframeElement.contentWindow.postMessage(
        {
          type: 'get_session',
        },
        this.#origin
      );
      setTimeout(() => {
        this.#eventEmitter.off('get_session_response', onEvent);
        resolve(null);
      }, 2500);
    });
  }

  async initialize() {
    await this.#initializeIframe();
  }

  #iframeEventHandler = (event: MessageEvent) => {
    if (event.origin !== this.#origin) {
      return;
    }
    if (!event.data || !this.#HANDLED_EVENT_TYPES.includes(event.data.type)) {
      return;
    }

    switch (event.data.type) {
      case 'initialized':
        this.#iframeInitialized = true;
        this.getSession();
        this.#eventEmitter.emit('initialized');
        break;
      case 'get_session_response':
        if (event.data.success === false) {
          console.error('Failed to get session');
        } else {
          this.#session = event.data.response.data;
        }
        this.#eventEmitter.emit('get_session_response');
        break;
      default:
        break;
    }
  };

  #initializeIframe = async () => {
    if (!this.#iframe) {
      this.#iframe = document.createElement('iframe');
      this.#iframe.setAttribute('width', '0');
      this.#iframe.setAttribute('height', '0');
      this.#iframe.setAttribute('display', 'none');
      this.#iframe.setAttribute('id', 'foo');

      window.addEventListener(
        'message',
        this.#iframeEventHandler.bind(this),
        false
      );
      document.body.appendChild(this.#iframe);
      this.#iframe.src = `${this.#origin}/auth/session`;
    }
  };
}
