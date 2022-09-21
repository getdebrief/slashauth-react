import { DEFAULT_SLASHAUTH_CLIENT } from '../shared/constants';
import {
  ExchangeTokenEndpointOptions,
  GetAppConfigAPIResponse,
  GetAppConfigOptions,
  GetAppConfigResponse,
  GetNonceToSignEndpointOptions,
  GetNonceToSignResponse,
  GetRoleMetadataOptions,
  GetRoleMetadataResponse,
  HasOrgRoleOptions,
  HasRoleOptions,
  HasRoleResponse,
  LoginWithSignedNonceOptions,
  LoginWithSignedNonceResponse,
  RefreshTokenOptions,
  RefreshTokenResponse,
  TokenEndpointOptions,
  TokenEndpointResponse,
} from '../shared/global';
import { getJSON, switchFetch } from './http';
import { createQueryParams } from '../shared/utils';

export async function logout(url: string) {
  return await switchFetch(url, 'default', '', {
    method: 'GET',
    headers: {
      'X-SlashAuth-Client': btoa(JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)),
    },
  });
}

export async function getAppConfig({
  baseUrl,
  client_id,
}: GetAppConfigOptions): Promise<GetAppConfigResponse> {
  return (
    await getJSON<GetAppConfigAPIResponse>(
      `${baseUrl}/p/${client_id}/config`,
      10000,
      'default',
      '',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-SlashAuth-Client': btoa(JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)),
        },
      }
    )
  ).data;
}

export async function getNonceToSign({
  baseUrl,
  ...options
}: GetNonceToSignEndpointOptions) {
  const queryString = createQueryParams(options);
  return await getJSON<GetNonceToSignResponse>(
    `${baseUrl}/getNonceToSign?${queryString}`,
    100000,
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

export async function exchangeToken({
  baseUrl,
  requirements,
  accessToken,
  ...options
}: ExchangeTokenEndpointOptions) {
  const body = {
    ...requirements,
  };
  const queryString = createQueryParams(options);
  return await getJSON<LoginWithSignedNonceResponse>(
    `${baseUrl}/exchange_token?${queryString}`,
    100000,
    'default',
    '',
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
    100000,
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
    10000,
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
  accessToken,
}: HasRoleOptions): Promise<HasRoleResponse> => {
  const queryString = createQueryParams({
    role: Buffer.from(roleName).toString('base64'),
    encoded: true,
  });
  return await getJSON<HasRoleResponse>(
    `${baseUrl}/p/${clientID}/has_role?${queryString}`,
    1000,
    'default',
    '',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-SlashAuth-Client': Buffer.from(
          JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)
        ).toString('base64'),
      },
    }
  );
};

export const hasOrgRoleAPICall = async ({
  baseUrl,
  clientID,
  organizationID,
  roleName,
  accessToken,
}: HasOrgRoleOptions): Promise<HasRoleResponse> => {
  const queryString = createQueryParams({
    role: Buffer.from(roleName).toString('base64'),
    encoded: true,
  });
  return await getJSON<HasRoleResponse>(
    `${baseUrl}/p/${clientID}/organizations/${organizationID}/has_role?${queryString}`,
    1000,
    'default',
    '',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-SlashAuth-Client': Buffer.from(
          JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)
        ).toString('base64'),
      },
    }
  );
};

export const getRoleMetadataAPICall = async ({
  baseUrl,
  clientID,
  roleName,
  accessToken,
}: GetRoleMetadataOptions): Promise<GetRoleMetadataResponse> => {
  const queryString = createQueryParams({
    role: Buffer.from(roleName).toString('base64'),
  });
  return await getJSON<GetRoleMetadataResponse>(
    `${baseUrl}/p/${clientID}/role_metadata?${queryString}`,
    1000,
    'default',
    '',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-SlashAuth-Client': Buffer.from(
          JSON.stringify(DEFAULT_SLASHAUTH_CLIENT)
        ).toString('base64'),
      },
    }
  );
};

export async function oauthToken(
  {
    baseUrl,
    timeout,
    audience,
    scope,
    slashAuthClient,
    useFormData,
    ...options
  }: TokenEndpointOptions,
  worker?: Worker
) {
  const body = useFormData
    ? createQueryParams(options)
    : JSON.stringify(options);

  return await getJSON<TokenEndpointResponse>(
    `${baseUrl}/oidc/token`,
    timeout,
    audience || 'default',
    scope,
    {
      method: 'POST',
      body,
      headers: {
        'Content-Type': useFormData
          ? 'application/x-www-form-urlencoded'
          : 'application/json',
        'X-SlashAuth-Client': Buffer.from(
          JSON.stringify(slashAuthClient || DEFAULT_SLASHAUTH_CLIENT)
        ).toString('base64'),
      },
    },
    worker,
    useFormData
  );
}
