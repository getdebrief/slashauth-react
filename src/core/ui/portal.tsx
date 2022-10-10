import React from 'react';
import ReactDOM, { createPortal } from 'react-dom';

import { ComponentContext } from './components/sign-in/context';
import { VirtualRouter } from './router/virtual';
import { AvailableComponentCtx } from './types/ui-components';

type PortalProps<
  CtxType extends AvailableComponentCtx,
  PropsType = Omit<CtxType, 'componentName'>
> = {
  node: HTMLDivElement;
  component:
    | React.FunctionComponent<PropsType>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentClass<PropsType, any>;
  props: PropsType & { path?: string; routing?: string };
  preservedParams?: string[];
} & Pick<CtxType, 'componentName'>;

export class Portal<
  CtxType extends AvailableComponentCtx
> extends React.PureComponent<PortalProps<CtxType>> {
  render(): React.ReactPortal {
    const { props, component, componentName, node, preservedParams } =
      this.props;

    const el = (
      <ComponentContext.Provider
        value={{ componentName: componentName, ...props } as CtxType}
      >
        {React.createElement(component, props)}
      </ComponentContext.Provider>
    );

    let startPath = '';
    switch (componentName) {
      case 'SignIn':
        console.log('setting start path');
        startPath = '/sign-in';
        break;
      default:
        break;
    }

    return ReactDOM.createPortal(
      <VirtualRouter preservedParams={preservedParams} startPath={startPath}>
        {el}
      </VirtualRouter>,
      node
    );
  }
}

type BasicPortalProps = React.PropsWithChildren<Record<string, unknown>>;

export const BasicPortal = (props: BasicPortalProps) => {
  const elem = document.createElement('div');
  const elRef = React.useRef(elem);

  React.useEffect(() => {
    document.body.appendChild(elRef.current);
    return () => {
      document.body.removeChild(elem);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(props.children, elRef.current);
};
