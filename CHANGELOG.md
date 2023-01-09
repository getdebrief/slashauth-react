# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] - yyyy-mm-dd

Here we write upgrading notes for brands. It's a team effort to make them as
straightforward as possible.

### Added

- [PROJECTNAME-XXXX](http://tickets.projectname.com/browse/PROJECTNAME-XXXX)
  MINOR Ticket title goes here.
- [PROJECTNAME-YYYY](http://tickets.projectname.com/browse/PROJECTNAME-YYYY)
  PATCH Ticket title goes here.

### Changed

- Updated README by replacing `loginNoRedirectNoPopup` with `openSignIn`
- Updated tests by replacing `loginNoRedirectNoPopup` with `openSignIn`

### Fixed

## [0.11.3] - 2020-11-9

### Added

### Changed

### Fixed

- Set default connectors when a user passes in a wagmiClient with no connectors.

## [0.11.0] - 2020-10-24

### Added

### Changed

- Removed the function `loginNoRedirectNoPopup` as it simply called `openSignIn` under the hood
- Renamed `getTokensSilently` to `getTokens`. This uses the plural `tokens` because with the verbose flag, this returns all tokens (access token, refresh token, and identity token)
- Border Radius from the modal styles now affects both the modal as well as any buttons internal to the modal.

### Fixed

## [0.10.0] - 2020-10-13

### Added

- Expose specific hooks: `useIsAuthenticated`, `useHasRole` and `hasOrgRole`

### Changed

### Fixed
