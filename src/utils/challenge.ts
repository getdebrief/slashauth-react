import { bufferToBase64UrlEncoded, sha256 } from '.';
import { createRandomString } from './string';

export type CodeVerifier = {
  verifier: string;
  challenge: string;
  method: string;
};

export const createCodeVerifier = async (): Promise<CodeVerifier> => {
  const codeVerifier = createRandomString(64);
  const codeChallengeBuffer = await sha256(codeVerifier);
  const codeChallenge = bufferToBase64UrlEncoded(codeChallengeBuffer);

  return {
    verifier: codeVerifier,
    challenge: codeChallenge,
    method: 'S256',
  };
};
