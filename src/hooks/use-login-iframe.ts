import { useCallback, useEffect, useRef, useState } from 'react';
import {
  eventEmitter,
  IFRAME_LOGIN_WITH_SIGNED_NONCE_RESPONSE,
  IFRAME_NONCE_RECEIVED,
} from '../events';
import { createRandomString } from '../utils/string';

export const useIframe = () => {
  const hasLoaded = useRef<boolean>(false);
  const listenerSetup = useRef(false);
  const iframeID = useRef<string>(null);

  const [iframeInitialized, setIframeInitialized] = useState(false);

  const handleMessage = (msg: MessageEvent) => {
    if (!iframeID.current) {
      return;
    }
    const docElem: HTMLIFrameElement = document.getElementById(
      iframeID.current
    ) as HTMLIFrameElement;
    if (!docElem) {
      return;
    }
    if (msg.source !== docElem.contentWindow) {
      // Ignore
      return;
    }
    if (typeof msg.data !== 'object') {
      return;
    }

    const data = msg.data;
    if (typeof data !== 'object') {
      return;
    }

    switch (data.type) {
      case 'GET_NONCE_RESPONSE':
        console.log('get nonce response');
        eventEmitter.emit(IFRAME_NONCE_RECEIVED, {
          address: data.address,
          nonce: data.nonce,
          success: data.success,
          error: data.error,
        });
        break;
      case 'LOGIN_WITH_SIGNED_NONCE_RESPONSE':
        console.log('login with signed nonce response');
        eventEmitter.emit(IFRAME_LOGIN_WITH_SIGNED_NONCE_RESPONSE, {
          success: data.success,
          address: data.address,
          error: data.error,
        });
        break;
      case 'UNKNOWN':
        break;
      default:
        console.log('unknown message');
    }
  };

  const sendMessage = useCallback((data: Record<string, unknown>) => {
    if (iframeID.current) {
      const iframeElem = document.getElementById(
        iframeID.current
      ) as HTMLIFrameElement;
      if (!iframeElem) {
        return;
      }
      if (!data['id']) {
        data['id'] = createRandomString(16);
      }
      const origin = new URL(iframeElem.src).origin;
      iframeElem.contentWindow?.postMessage(data, origin);
    }
  }, []);

  const sendGetNonceMessage = useCallback(
    (address: string, deviceID: string) => {
      sendMessage({
        type: 'GET_NONCE',
        address,
        deviceID,
      });
    },
    [sendMessage]
  );

  const sendLoginWithSignedNonceMessage = useCallback(
    (address: string, deviceID: string, signature: string) => {
      sendMessage({
        type: 'LOGIN_WITH_SIGNED_NONCE',
        address,
        deviceID,
        signature,
      });
    },
    [sendMessage]
  );

  if (hasLoaded.current && !listenerSetup.current) {
    console.log('listening');
    window.addEventListener('message', handleMessage);
    listenerSetup.current = true;
  }

  const mountIframe = useCallback((url: string) => {
    console.log('mount iframe');
    if (hasLoaded.current) {
      return;
    }
    hasLoaded.current = true;
    const id = `slashauth-login_${createRandomString(8)}`;
    iframeID.current = id;
    let elem: HTMLIFrameElement;
    if (typeof document !== 'undefined') {
      elem = document.createElement('iframe');
      elem.id = id;
      elem.src = url;
      elem.width = '0';
      elem.height = '0';

      const handleLoad = () => {
        const iframeElem = document.getElementById(id) as HTMLIFrameElement;
        iframeElem.style.zIndex = '-1';
        iframeElem.style.display = 'none';
        setIframeInitialized(true);
      };

      elem.onload = handleLoad;

      document.body.appendChild(elem);
    }
  }, []);

  const unmountIframe = useCallback(() => {
    if (
      hasLoaded.current &&
      iframeID.current &&
      typeof document !== 'undefined' &&
      iframeID.current
    ) {
      const iframeElem = document.getElementById(
        iframeID.current
      ) as HTMLIFrameElement;
      if (iframeElem) {
        document.body.removeChild(iframeElem);
      }
    }
    setIframeInitialized(false);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined' && iframeID.current) {
        const iframeElem = document.getElementById(
          iframeID.current
        ) as HTMLIFrameElement;
        if (iframeElem) {
          document.body.removeChild(iframeElem);
        }
      }
    };
  }, [sendMessage]);

  return {
    initialized: iframeInitialized,
    mountIframe,
    unmountIframe,
    sendGetNonceMessage,
    sendLoginWithSignedNonceMessage,
  };
};
