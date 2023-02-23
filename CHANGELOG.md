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

### Fixed

## [2.1.1] - 2023-02-23

### Fixed

- Fixed sign-in modal user experience in mobile [#80](https://github.com/slashauth/slashauth-react/pull/80)

## [2.0.0] - 2023-02-14

### Added

- Support for React v18 rendering.

### Changed

#### Breaking changes

- This removes support for React v17. In order to continue using React v17, use major version 1.

## [1.5.0] - 2023-02-06

### Added

- Support to collect email after wallet sign in if app requires it

### Changed

### Fixed

## [1.4.0] - 2023-02-06

### Added

- Add UserAccountSettings component, that displays basic profile information to the logged in user (profile pic, name and existing connections like wallets or email)

### Changed

- Revert removal of close signin modal when clicking outside
- Display web3 login methods even if the user is already signed with one in the sign in component

### Fixed

- Hide scroll bar on signin component

## [1.1.0] - 2023-01-20

### Added

- Only display a max of 4 login methods by default with the possibility of showing all of them by clicking the More Wallets button

### Changed

- Display last the disabled login methods

## [1.0.1] - 2023-01-20

### Added

- Show link to open gmail if gmail.com domain in the magic link flow

### Fixed

- Retry magic link

## [1.0.0] - 2023-01-20

Redesign for the sign-in component.

### Added

- New theming options
- Unified header with logo and different background for all screens
- Powered by SlashAuth link in the footer

### Changed

- Desktop layout to 2 columns
- Login methods selection screen design
- Failure and success screens designs

### Fixed

## [0.14.0] - 2023-01-09

### Added

### Changed

- Replaced loader with a new design
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
