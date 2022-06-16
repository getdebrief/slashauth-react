import { DEFAULT_SLASHAUTH_CLIENT } from './constants';
import {
  GetNonceToSignEndpointOptions,
  GetNonceToSignResponse,
  HasRoleOptions,
  HasRoleResponse,
  LoginWithSignedNonceOptions,
  LoginWithSignedNonceResponse,
  RefreshTokenOptions,
  RefreshTokenResponse,
} from './global';
import { getJSON, switchFetch } from './http';
import { createQueryParams } from './utils';

export async function logout(url: string) {
  return await switchFetch(url, 'default', '', {
    method: 'GET',
    headers: {
      'X-SlashAuth-Client': btoa(JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)),
    },
  });
}

export async function getNonceToSign({
  baseUrl,
  ...options
}: GetNonceToSignEndpointOptions) {
  const queryString = createQueryParams(options);
  return await getJSON<GetNonceToSignResponse>(
    `${baseUrl}/getNonceToSign?${queryString}`,
    1000,
    'default',
    '',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-SlashAuth-Client': btoa(JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)),
      },
    }
  );
}

export async function loginWithSignedNonce({
  baseUrl,
  ...options
}: LoginWithSignedNonceOptions) {
  const queryString = createQueryParams(options);
  return await getJSON<LoginWithSignedNonceResponse>(
    `${baseUrl}/loginWithSignedNonce?${queryString}`,
    1000,
    'default',
    '',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-SlashAuth-Client': btoa(JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)),
      },
    }
  );
}

export async function refreshToken({
  baseUrl,
  ...options
}: RefreshTokenOptions) {
  const queryString = createQueryParams(options);
  return await getJSON<RefreshTokenResponse>(
    `${baseUrl}/refresh_token?${queryString}`,
    1000,
    'default',
    '',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-SlashAuth-Client': btoa(JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)),
      },
    }
  );
}

export const hasRoleAPICall = async ({
  baseUrl,
  clientID,
  roleName,
}: HasRoleOptions): Promise<HasRoleResponse> => {
  const queryString = createQueryParams({
    role: Buffer.from(roleName).toString('base64'),
  });
  return await getJSON<HasRoleResponse>(
    `${baseUrl}/p/${clientID}/?${queryString}`,
    1000,
    'default',
    '',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-SlashAuth-Client': Buffer.from(
          JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)
        ).toString('base64'),
      },
    }
  );
};
