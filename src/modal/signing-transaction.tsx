export const SigningTransactionModalContents = () => {
  return (
    <div style={{ margin: '1rem 0', padding: '2rem' }}>
      <p style={{ fontSize: '16px', fontWeight: 500 }}>
        Sign the message with your wallet to continue
      </p>
      <p
        style={{
          fontSize: '14px',
          fontWeight: 400,
          textAlign: 'left',
          marginTop: '0.75rem',
        }}
      >
        Check your wallet app or plugin (e.g. metamask, coinbase) to continue
        logging in.
      </p>
    </div>
  );
};
