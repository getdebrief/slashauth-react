import React from 'react';
import ReactDOM, { createPortal } from 'react-dom';

import { ComponentContext } from './components/sign-in/context';
import { HashRouter } from './router/hash';
import { AvailableComponentCtx } from './types/ui-components';

type PortalProps<
  CtxType extends AvailableComponentCtx,
  PropsType = Omit<CtxType, 'componentName'>
> = {
  node: HTMLDivElement;
  component:
    | React.FunctionComponent<PropsType>
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

    return ReactDOM.createPortal(
      <HashRouter preservedParams={preservedParams}>{el}</HashRouter>,
      node
    );
  }
}

type BasicPortalProps = React.PropsWithChildren<Record<string, unknown>>;

export const BasicPortal = (props: BasicPortalProps) => {
  const elRef = React.useRef(document.createElement('div'));

  React.useEffect(() => {
    document.body.appendChild(elRef.current);
    return () => {
      document.body.removeChild(elRef.current);
    };
  }, []);

  return createPortal(props.children, elRef.current);
};
