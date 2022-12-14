import React from 'react';

import { createContextAndHook } from '../../../shared/utils';

type FlowMetadata = {
  flow: 'sign-in' | 'wallet-connect';
  part?:
    | 'start'
    | 'sign-nonce'
    | 'wallet'
    | 'ethWallet'
    | 'emailLink'
    | 'emailLinkVerify'
    | 'emailLinkStatus'
    | 'federatedGoogle'
    | 'error'
    | 'popover'
    | 'complete';
};

const [FlowMetadataCtx, useFlowMetadata] =
  createContextAndHook<FlowMetadata>('FlowMetadata');

const FlowMetadataProvider = (props: React.PropsWithChildren<FlowMetadata>) => {
  const { flow, part } = props;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = React.useMemo(() => ({ value: props }), [flow, part]);
  return (
    <FlowMetadataCtx.Provider value={value}>
      {props.children}
    </FlowMetadataCtx.Provider>
  );
};

export { useFlowMetadata, FlowMetadataProvider };
export type { FlowMetadata };
