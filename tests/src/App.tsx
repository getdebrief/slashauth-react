import { useSlashAuth } from '@slashauth/slashauth-react';

import './App.css';
import { useEffect, useRef } from 'react';

const wagmigotchiABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'caretaker',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'CaretakerLoved',
    type: 'event',
  },
  {
    inputs: [],
    name: 'clean',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAlive',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBoredom',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getHunger',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSleepiness',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStatus',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getUncleanliness',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'love',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'play',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sleep',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

function App() {
  const context = useSlashAuth();

  const {
    initialized,
    isAuthenticated,
    logout,
    loginNoRedirectNoPopup,
    connect,
    mountDropDown,
  } = context;

  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) mountDropDown(ref.current);
  }, [mountDropDown]);

  return (
    <div className="App">
      <header className="App-header">
        <button
          onClick={() => {
            console.log(initialized);
          }}
        >
          Check if ready
        </button>
        <button
          onClick={() => {
            connect(false);
          }}
        >
          Connect non transparent
        </button>
        <button
          onClick={() => {
            connect(true);
          }}
        >
          Connect transparent
        </button>
        {!isAuthenticated && (
          <button
            onClick={() => {
              loginNoRedirectNoPopup();
            }}
          >
            Open sign in
          </button>
        )}
        {isAuthenticated && (
          <button
            onClick={() => {
              logout();
            }}
          >
            Logout
          </button>
        )}
        <div ref={ref} />
      </header>
    </div>
  );
}

export default App;
