import { useEffect, useMemo, useRef, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import { useCoreSlashAuth } from '../../context/core-slashauth';
import { shortenEthAddress } from '../../../../shared/utils/eth';
import { profilePicturePlaceholder } from './profilePicturePlaceholder';
import { chevronDown } from './chevronDown';
import { googleIcon } from './googleIcon';
import { twitterIcon } from './twitterIcon';
import { copyIcon } from './copyIcon';
import { plusIcon } from './plusIcon';
import { gearIcon } from './gearIcon';
import { logoutIcon } from './logoutIcon';

type TestUser = {
  name?: string;
  loggedIn: boolean;
  wallet?: { default: string };
  email?: string;
  social?: {
    google: string;
    twitter: string;
  };
};
export const DropDown = () => {
  const user: TestUser = testUser.walletOnly;
  const [isOpen, setIsOpen] = useState(false);
  const context = useCoreSlashAuth();
  const { isReady, logout, openSignIn, connectWallet } = context;
  const [wallet, walletDisplay] = useMemo(() => {
    if (user.wallet) {
      const address: string = user.wallet.default.split(':')[1]; //undefined possible
      const walletDisplay = shortenEthAddress(address);
      return [address, walletDisplay];
    }
    return [];
  }, [user.wallet]);
  const ref = useRef();
  useEffect(() => {
    const listener = (evt: MouseEvent) => {
      if (!ref.current) return;
      const topDiv = ref.current;
      let targetEl = evt.target;
      do {
        if (targetEl === topDiv) {
          return;
        }
        // Go up the DOM
        targetEl = (targetEl as HTMLElement).parentNode;
      } while (targetEl);
      setIsOpen(false);
    };
    document.addEventListener('click', listener);
    return () => {
      document.removeEventListener('click', listener);
    };
  }, []);

  const loggedOutContent = (
    <>
      <Section>
        <Row>
          <div
            style={{ textAlign: 'left', fontSize: '14px', lineHeight: '20px' }}
          >
            Login to <strong>{testCompany}</strong> to view account settings
          </div>
        </Row>
      </Section>
      <Section>
        <div
          onClick={() => {
            openSignIn({});
          }}
          style={{
            background: '#2F5FFC',
            color: 'white',
            padding: '6px 52px',
            fontWeight: 500,
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          Login to continue
        </div>
      </Section>
    </>
  );
  const primaryId: 'name' | 'wallet' | 'email' = (
    ['name', 'wallet', 'email'] as const
  ).find((e) => !!user[e]);
  console.log('primaryId', primaryId);
  let hashDisplayElement: JSX.Element;
  if (walletDisplay) {
    hashDisplayElement = (
      <Row
        style={
          primaryId === 'wallet'
            ? {
                ...primaryIdStyle,
              }
            : undefined
        }
      >
        {walletDisplay}
        <Icon
          style={{ marginLeft: 8, cursor: 'pointer' }}
          onClick={() => {
            navigator.clipboard.writeText(wallet);
          }}
        >
          {copyIcon}
        </Icon>
      </Row>
    );
  } else {
    hashDisplayElement = (
      <Row
        style={{
          paddingTop: 8,
          color: '#2F5FFC',
        }}
        onClick={() => {
          connectWallet();
        }}
      >
        <Icon>{plusIcon}</Icon>
        Connect web3 wallet
      </Row>
    );
  }
  const firstSection = (
    <>
      {primaryId !== 'wallet' && <PrimaryID>{user[primaryId]}</PrimaryID>}
      {hashDisplayElement}
    </>
  );

  if (!isReady()) return <ScaleLoader height={35} width={4} />;
  const loggedInContent = (
    <>
      <Section style={{ borderTop: 'none' }}>{firstSection}</Section>
      {(user.social?.twitter || user.social?.google) && (
        <Section>
          <Row>
            <Icon>{twitterIcon}</Icon>
            {user.social?.twitter}
          </Row>
          <Row
            style={{
              paddingTop: 8,
            }}
          >
            <Icon>{googleIcon}</Icon>
            {user.social?.google}
          </Row>
        </Section>
      )}
      <Section>
        <Row
          onClick={() => {
            console.log('manage account');
          }}
        >
          <Icon>{gearIcon}</Icon>
          Manage account
        </Row>
      </Section>
      <Section>
        <Row
          onClick={() => {
            logout();
            setIsOpen(false);
          }}
        >
          <Icon>{logoutIcon}</Icon>
          Sign out
        </Row>
      </Section>
    </>
  );
  return (
    <div
      style={{
        position: 'relative',
        color: '#374151',
      }}
      ref={ref}
    >
      <div
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 500,
          fontSize: '16px',
          lineHeight: '20px',
          border: user.wallet ? '1px solid #E6E8EB' : undefined,
          borderRadius: '22px',
        }}
        onClick={() => {
          setIsOpen((b) => !b);
        }}
      >
        <div
          style={{
            margin: user.wallet ? 3 : undefined,
            display: 'flex',
          }}
        >
          {profilePicturePlaceholder}
        </div>
        {user.wallet && (
          <>
            <div
              style={{
                marginLeft: 10,
              }}
            >
              {walletDisplay}
            </div>
            <div
              style={{
                marginLeft: 14,
                marginRight: 13,
              }}
            >
              {chevronDown}
            </div>
          </>
        )}
      </div>
      {isOpen && (
        <Content>{user.loggedIn ? loggedInContent : loggedOutContent}</Content>
      )}
    </div>
  );
};
const testUser: { [k: string]: TestUser } = {
  walletOnly: {
    loggedIn: true,
    wallet: {
      default: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
    },
  },
  loggedOut: {
    loggedIn: false,
  },
  emailOnly: {
    loggedIn: true,
    email: 'Hailey@slashauth.com',
    wallet: undefined,
  },
  walletSocial: {
    loggedIn: true,
    wallet: {
      default: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
    },
    social: { google: 'haileymiller298@gmail.com', twitter: '@0xhaileym' },
  },
  nameWalletSocial: {
    name: 'Hailey Miller',
    loggedIn: true,
    wallet: {
      default: 'eth:0x6c713198b09add6ee54c535e4135860907afd4b4',
    },
    social: { google: 'haileymiller298@gmail.com', twitter: '@0xhaileym' },
  },
};
const testCompany = 'Acme corp';

const PrimaryID = ({ children }) => (
  <div style={primaryIdStyle}>{children}</div>
);
const primaryIdStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '16px',
  lineHeight: '20px',
  textAlign: 'left',
};

const Icon = (
  props_: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { style, ...props } = props_;
  return (
    <div
      style={{
        marginRight: 10,
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
      {...props}
    />
  );
};

const Content = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      right: 0,
      background: 'white',
      minWidth: 246,
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
      borderRadius: '6px',
      marginTop: 10,
    }}
  >
    {children}
  </div>
);
const Row = (
  props_: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { style, onClick, ...props } = props_;
  return (
    <div
      style={{
        display: 'flex',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onClick={onClick}
      {...props}
    />
  );
};
const Section = (
  props_: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { style, ...props } = props_;
  return (
    <div
      style={{
        fontSize: 12,
        lineHeight: '20px',
        borderTop: '1px solid #E7E9ED',
        padding: 15,
        ...style,
      }}
      {...props}
    />
  );
};
