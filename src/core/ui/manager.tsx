import React from 'react';
import ReactDOM from 'react-dom';
import { PRESERVED_QUERYSTRING_PARAMS } from '../../shared/constants';
import { useSafeLayoutEffect } from '../../shared/hooks';
import { SlashAuthOptions, SlashAuthStyle } from '../../shared/types';
import { ensureDomElementExists } from '../../shared/utils/dom-element';
import { uninitializedStub } from '../../shared/utils/stub';
import { SlashAuth } from '../slashauth';
import { Modal } from './components/modal';
import { SignIn, SignInModal } from './components/sign-in';
import { AppearanceProvider } from './context/appearance';
import { EnvironmentProvider } from './context/environment';
import { FlowMetadataProvider } from './context/flow';
import { SlashAuthUIProvider } from './context/slashauth';
import { Portal } from './portal';
import { VirtualRouter } from './router/virtual';
import { Environment } from './types/environment';
import { ModalType } from './types/modal';
import {
  AvailableComponentCtx,
  AvailableComponentProps,
  SignInProps,
} from './types/ui-components';
import { DropDown } from './components/drop-down';

// TODO: We need to handle the ability to bundle both react-17 and react-18 here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// let createRoot: any;
// if (parseInt(ReactDOM.version.split('.')[0]) > 17) {
//   // This is hacky but the only way to get around it.
//   await import('react-dom/client').then(({ createRoot: domCreateRoot }) => {
//     createRoot = domCreateRoot;
//   });
// }

export type ComponentListener = (payload: ComponentListenerPayload) => void;
export type ComponentListenerPayload = {
  action: 'open' | 'close' | 'mount' | 'unmount';
  type: ModalType;
};
export type UnsubscribeFn = () => void;

export interface ComponentControls {
  mountComponent: (params: {
    appearanceKey: Uncapitalize<AvailableComponentNames>;
    name: AvailableComponentNames;
    node: HTMLDivElement;
    props: AvailableComponentProps;
  }) => void;
  unmountComponent: (params: { node: HTMLDivElement }) => void;
  openModal: <T extends ModalType>(
    modalType: T,
    props: T extends ModalType.SignIn ? SignInProps : never
  ) => void;
  updateProps: (params: {
    appearance?: SlashAuthStyle | undefined;
    options?: SlashAuthOptions | undefined;
    node?: HTMLDivElement;
    props?: unknown;
    appearanceOverride?: SlashAuthStyle | undefined;
  }) => void;
  closeModal: (modalType: ModalType) => void;

  addListener: (listener: ComponentListener) => UnsubscribeFn;
}

const componentController: ComponentControls = {
  mountComponent: uninitializedStub,
  unmountComponent: uninitializedStub,
  openModal: uninitializedStub,
  updateProps: uninitializedStub,
  closeModal: uninitializedStub,
  addListener: uninitializedStub,
};

const AvailableComponents = {
  SignIn,
  DropDown,
};

type AvailableComponentNames = keyof typeof AvailableComponents;

interface HtmlNodeOptions {
  key: string;
  name: AvailableComponentNames;
  appearanceKey: Uncapitalize<AvailableComponentNames>;
  props?: AvailableComponentProps;
}

interface ComponentManagerState {
  appearance?: SlashAuthStyle;
  appearanceOverride?: SlashAuthStyle | undefined;
  options?: SlashAuthOptions | undefined;
  signInModal: null | SignInProps;
  nodes: Map<HTMLDivElement, HtmlNodeOptions>;
  listeners: ComponentListener[];
}

interface ComponentManagerComponentProps {
  slashAuth: SlashAuth;
  environment: Environment;
  options: SlashAuthOptions;
}

let domElementCount = 0;

const mountComponentManager = (
  slashAuth: SlashAuth,
  environment: Environment,
  options: SlashAuthOptions
): ComponentControls => {
  // TODO: Init of components should start
  // before /env and /client requests
  const slashAuthRoot = document.createElement('div');
  slashAuthRoot.setAttribute('id', 's8-components');
  document.body.appendChild(slashAuthRoot);

  ReactDOM.render<ComponentManagerComponentProps>(
    <ComponentManagerComponent
      slashAuth={slashAuth}
      options={options}
      environment={environment}
    />,
    slashAuthRoot
  );

  return componentController;
};

const ComponentManagerComponent = (props: ComponentManagerComponentProps) => {
  const [managerState, setManagerState] = React.useState<ComponentManagerState>(
    {
      appearance: props.options.componentSettings,
      appearanceOverride: undefined,
      options: props.options,
      signInModal: null,
      nodes: new Map(),
      listeners: [],
    }
  );

  const { signInModal, nodes } = managerState;

  useSafeLayoutEffect(() => {
    componentController.mountComponent = (params) => {
      const { node, name, props, appearanceKey } = params;
      ensureDomElementExists(node);
      setManagerState((curr) => {
        curr.nodes.set(node, {
          key: `slashauth-component-${++domElementCount}`,
          name,
          props,
          appearanceKey,
        });
        return { ...curr, nodes };
      });
      managerState.listeners.forEach((l) => {
        l({
          action: 'mount',
          type: ModalType.SignIn,
        });
      });
    };

    componentController.unmountComponent = (params) => {
      const { node } = params;
      setManagerState((curr) => {
        curr.nodes.delete(node);
        return { ...curr, nodes };
      });
      managerState.listeners.forEach((l) => {
        l({
          action: 'unmount',
          type: ModalType.SignIn,
        });
      });
    };

    componentController.updateProps = ({ node, props, ...restProps }) => {
      if (node && props && typeof props === 'object') {
        const nodeOptions = managerState.nodes.get(node);
        if (nodeOptions) {
          nodeOptions.props = { ...props };
          setManagerState((curr) => ({ ...curr }));
          return;
        }
      }
      setManagerState((curr) => ({ ...curr, ...restProps }));
    };

    componentController.closeModal = (name) => {
      setManagerState((curr) => ({ ...curr, [name + 'Modal']: null }));
      managerState.listeners.forEach((l) => {
        l({
          action: 'close',
          type: name,
        });
      });
    };

    componentController.openModal = (name, props) => {
      setManagerState((curr) => ({ ...curr, [name + 'Modal']: props }));
      managerState.listeners.forEach((l) => {
        l({
          action: 'open',
          type: name,
        });
      });
    };

    componentController.addListener = (listener: ComponentListener) => {
      const unsubscribeFn = () => {
        setManagerState((curr) => {
          curr.listeners = curr.listeners.filter((l) => l !== listener);
          return { ...curr };
        });
      };
      setManagerState((curr) => {
        curr.listeners.push(listener);
        return { ...curr };
      });
      return unsubscribeFn;
    };
  }, []);

  const mountedSignInModal = (
    <AppearanceProvider
      signInModalStyle={
        managerState.appearanceOverride?.signInModalStyle ||
        managerState.appearance?.signInModalStyle
      }
    >
      <FlowMetadataProvider flow={'sign-in'}>
        <Modal
          handleClose={() => componentController.closeModal(ModalType.SignIn)}
        >
          <VirtualRouter
            preservedParams={PRESERVED_QUERYSTRING_PARAMS}
            onExternalNavigate={() =>
              componentController.closeModal(ModalType.SignIn)
            }
            startPath="/sign-in"
          >
            <SignInModal {...signInModal} />
          </VirtualRouter>
        </Modal>
      </FlowMetadataProvider>
    </AppearanceProvider>
  );

  return (
    <SlashAuthUIProvider slashAuth={props.slashAuth}>
      <EnvironmentProvider value={props.environment}>
        {[...nodes].map(([node, component]) => {
          return (
            <AppearanceProvider
              key={component.key}
              signInModalStyle={
                managerState.appearanceOverride?.signInModalStyle ||
                managerState.appearance?.signInModalStyle
              }
            >
              <Portal<AvailableComponentCtx>
                componentName={component.name}
                key={component.key}
                component={AvailableComponents[component.name]}
                props={component.props || {}}
                node={node}
                preservedParams={PRESERVED_QUERYSTRING_PARAMS}
              />
            </AppearanceProvider>
          );
        })}
        {signInModal && mountedSignInModal}
      </EnvironmentProvider>
    </SlashAuthUIProvider>
  );
};

export { mountComponentManager, ComponentManagerComponent };
