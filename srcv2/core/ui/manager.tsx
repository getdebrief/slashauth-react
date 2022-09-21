import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import { PRESERVED_QUERYSTRING_PARAMS } from '../../shared/constants';
import { useSafeLayoutEffect } from '../../shared/hooks';
import { SlashAuthOptions, SlashAuthStyle } from '../../shared/types';
import { ensureDomElementExists } from '../../shared/utils/dom-element';
import { uninitializedStub } from '../../shared/utils/stub';
import { SlashAuth } from '../slashauth';
import { Modal } from './components/modal';
import { SignInModal } from './components/sign-in';
import { AppearanceProvider } from './context/appearance';
import { EnvironmentProvider } from './context/environment';
import { FlowMetadataProvider } from './context/flow';
import { SlashAuthUIProvider } from './context/slashauth';
import { Portal } from './portal';
import { VirtualRouter } from './router/virtual';
import { Environment } from './types/environment';
import { ModalType } from './types/modal';
import { AvailableComponentProps, SignInProps } from './types/ui-components';

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

const AvailableComponents = {};

type AvailableComponentNames = keyof typeof AvailableComponents;

interface HtmlNodeOptions {
  key: string;
  name: AvailableComponentNames;
  appearanceKey: Uncapitalize<AvailableComponentNames>;
  // TODO: Extend this for other drop in components.
  props?: SignInProps;
}

interface ComponentManagerState {
  modalSettings?: SlashAuthStyle | undefined;
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

  if (ReactDOMClient && ReactDOMClient.createRoot) {
    const root = ReactDOMClient.createRoot(slashAuthRoot);
    root.render(
      <ComponentManagerComponent
        slashAuth={slashAuth}
        options={options}
        environment={environment}
      />
    );
  } else {
    ReactDOM.render<ComponentManagerComponentProps>(
      <ComponentManagerComponent
        slashAuth={slashAuth}
        options={options}
        environment={environment}
      />,
      slashAuthRoot
    );
  }

  return componentController;
};

const ComponentManagerComponent = (props: ComponentManagerComponentProps) => {
  const [managerState, setManagerState] = React.useState<ComponentManagerState>(
    {
      modalSettings: props.options.componentSettings,
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
          type: name,
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
      signInModalStyle={managerState.modalSettings?.signInModalStyle}
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
              signInModalStyle={managerState.modalSettings?.signInModalStyle}
            >
              <Portal
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
