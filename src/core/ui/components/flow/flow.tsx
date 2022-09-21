import React from 'react';

import {
  FlowMetadata,
  FlowMetadataProvider,
  useFlowMetadata,
} from '../../context/flow';
import { RootBox } from '../root-box';
import { CLASS_PREFIX } from '../../types/ui-components';

const generateFlowClassname = (props: Pick<FlowMetadata, 'flow'>) => {
  return CLASS_PREFIX + props.flow + '-root';
};

type FlowRootProps = React.PropsWithChildren<Record<string, unknown>> &
  FlowMetadata;

const Root = (props: FlowRootProps) => {
  return (
    <FlowMetadataProvider flow={props.flow}>
      <RootBox className={generateFlowClassname(props)} {...props} />
    </FlowMetadataProvider>
  );
};

type FlowPartProps = React.PropsWithChildren<Pick<FlowMetadata, 'part'>>;

const Part = (props: FlowPartProps) => {
  const { flow } = useFlowMetadata();
  return (
    <FlowMetadataProvider flow={flow} part={props.part}>
      {props.children}
    </FlowMetadataProvider>
  );
};

export const Flow = {
  Root,
  Part,
};
