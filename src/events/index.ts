import EventEmitter from 'eventemitter3';

export const eventEmitter = new EventEmitter();

export type SlashauthEvent = string;
export const ACCOUNT_CHANGE_EVENT: SlashauthEvent = 'ACCOUNT_CHANGE';
export const CHAIN_CHANGE_EVENT: SlashauthEvent = 'CHAIN_CHANGE';
export const DISCONNECT_EVENT: SlashauthEvent = 'DISCONNECT';
export const CONNECT_EVENT: SlashauthEvent = 'CONNECT';

export const LOGIN_COMPLETE_EVENT: SlashauthEvent = 'LOGIN_COMPLETE';
export const LOGIN_FAILURE_EVENT: SlashauthEvent = 'LOGIN_FAILURE';

export const ACCOUNT_CONNECTED_EVENT: SlashauthEvent = 'ACCOUNT_CONNECTED';

export const LOGIN_STEP_CHANGED_EVENT: SlashauthEvent = 'LOGIN_STEP_CHANGED';

export const ADDITIONAL_INFO_SUBMIT_EVENT: SlashauthEvent =
  'ADDITIONAL_INFO_SUBMIT';

export const APP_CONFIG_UPDATED_EVENT: SlashauthEvent = 'APP_CONFIG_UPDATED';
