import { useConnect } from 'wagmi';
import { Modal } from './modal';

export const ConnectPopup = () => {
  // const { connect, connectors, error, isConnecting, pendingConnector } =
  //   useConnect();

  // const renderModal() {
  //   const el = document.createElement("div");
  //   el.id = WEB3_CONNECT_MODAL_ID;
  //   document.body.appendChild(el);

  //   ReactDOM.render(
  //     <Modal
  //       themeColors={this.themeColors}
  //       userOptions={this.userOptions}
  //       onClose={this.onClose}
  //       resetState={this.resetState}
  //       lightboxOpacity={this.lightboxOpacity}
  //     />,
  //     document.getElementById(WEB3_CONNECT_MODAL_ID)
  //   );
  // }

  // const _toggleModal = async () => {
  //   const d = typeof window !== "undefined" ? document : "";
  //   const body = d ? d.body || d.getElementsByTagName("body")[0] : "";
  //   if (body) {
  //     if (this.show) {
  //       body.style.overflow = "";
  //     } else {
  //       body.style.overflow = "hidden";
  //     }
  //   }
  //   await this.updateState({ show: !this.show });
  // };

  return (
    <Modal
      onClose={() => console.log('close')}
      resetState={() => console.log('reset')}
    />

    // <div>
    //   {connectors.map((connector) => (
    //     <button
    //       disabled={!connector.ready}
    //       key={connector.id}
    //       onClick={() => connect(connector)}
    //     >
    //       {connector.name}
    //       {!connector.ready && ' (unsupported)'}
    //       {isConnecting &&
    //         connector.id === pendingConnector?.id &&
    //         ' (connecting)'}
    //     </button>
    //   ))}

    //   {error && <div>{error.message}</div>}
    // </div>
  );
};
