import qs from 'qs';
import React from 'react';

import { getQueryParams, trimTrailingSlash } from '../../../shared/utils';
import { useWindowEventListener } from '../hooks';
import { newPaths } from './new-paths';
import { match } from './path-to-regexp';
import { Route } from './route';
import { RouteContext } from './context';

interface BaseRouterProps {
  basePath: string;
  startPath: string;
  getPath: () => string;
  getQueryString: () => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  internalNavigate: (toURL: URL) => Promise<any> | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onExternalNavigate?: () => any;
  refreshEvents?: Array<keyof WindowEventMap>;
  preservedParams?: string[];
  children: React.ReactNode;
}

export const BaseRouter = ({
  basePath,
  startPath,
  getPath,
  getQueryString,
  internalNavigate,
  onExternalNavigate,
  refreshEvents,
  preservedParams,
  children,
}: BaseRouterProps): JSX.Element => {
  const [routeParts, setRouteParts] = React.useState({
    path: getPath(),
    queryString: getQueryString(),
  });
  const currentPath = routeParts.path;
  const currentQueryString = routeParts.queryString;
  const currentQueryParams = getQueryParams(routeParts.queryString);

  const resolve = (to: string): URL => {
    return new URL(to, window.location.origin);
  };

  const getMatchData = (path?: string, index?: boolean) => {
    const [newIndexPath, newFullPath] = newPaths('', '', path, index);
    const currentPathWithoutSlash = trimTrailingSlash(currentPath);

    const matchResult =
      (path && match(newFullPath + '/:foo*')(currentPathWithoutSlash)) ||
      (index && match(newIndexPath)(currentPathWithoutSlash)) ||
      (index && match(newFullPath)(currentPathWithoutSlash)) ||
      false;
    if (matchResult !== false) {
      return matchResult.params;
    } else {
      return false;
    }
  };

  const matches = (path?: string, index?: boolean): boolean => {
    return !!getMatchData(path, index);
  };

  const refresh = React.useCallback((): void => {
    const newPath = getPath();
    const newQueryString = getQueryString();

    if (newPath !== currentPath || newQueryString !== currentQueryString) {
      setRouteParts({
        path: newPath,
        queryString: newQueryString,
      });
    }
  }, [currentPath, currentQueryString, getPath, getQueryString]);

  useWindowEventListener(refreshEvents, refresh);

  // TODO: Look into the real possible types of globalNavigate
  const baseNavigate = async (toURL: URL | undefined): Promise<unknown> => {
    if (!toURL) {
      return;
    }

    if (
      toURL.origin !== window.location.origin ||
      !toURL.pathname.startsWith('/' + basePath)
    ) {
      if (onExternalNavigate) {
        onExternalNavigate();
      }
      // return await externalNavigate(toURL.href);
      throw new Error('Not implemented');
    }

    // For internal navigation, preserve any query params
    // that are marked to be preserved
    if (preservedParams) {
      const toQueryParams = getQueryParams(toURL.search);
      preservedParams.forEach((param) => {
        if (!toQueryParams[param] && currentQueryParams[param]) {
          toQueryParams[param] = currentQueryParams[param];
        }
      });
      toURL.search = qs.stringify(toQueryParams);
    }
    const internalNavRes = await internalNavigate(toURL);
    setRouteParts({ path: toURL.pathname, queryString: toURL.search });
    return internalNavRes;
  };

  return (
    <RouteContext.Provider
      value={{
        basePath: basePath,
        startPath: startPath,
        fullPath: '',
        indexPath: '',
        currentPath: currentPath,
        queryString: currentQueryString,
        queryParams: currentQueryParams,
        getMatchData: getMatchData,
        matches: matches,
        baseNavigate: baseNavigate,
        navigate: async () => {
          //
        },
        resolve: resolve,
        refresh: refresh,
        params: {},
      }}
    >
      <Route path={basePath}>{children}</Route>
    </RouteContext.Provider>
  );
};
