# GitLab Notify Extension

![GitHub package.json version](https://img.shields.io/github/package-json/v/mikescops/gitlab-notify-extension) ![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/mikescops/gitlab-notify-extension/Lint%20&%20Build%20CI/master) ![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ekfpkkhpemajcbniegjicehdphdabhop) ![Chrome Web Store](https://img.shields.io/chrome-web-store/users/ekfpkkhpemajcbniegjicehdphdabhop) ![Mozilla Add-on](https://img.shields.io/amo/v/gitlab-notify) ![Mozilla Add-on](https://img.shields.io/amo/users/gitlab-notify)

_Don't miss any GitLab merge requests or issues and rocket up your productivity._

[Chrome Web Store](https://chrome.google.com/webstore/detail/ekfpkkhpemajcbniegjicehdphdabhop) | [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/gitlab-notify/)

![Preview of the browser extension: 30/03/2020](./preview.png)

**Gitlab Notify is able to:**

-   List Merge Requests you are assigned to
-   List Merge Requests you created
-   List Issues you are assigned to
-   Display your To-Do List

It comes with a bunch of features to let you access easily the information you're looking for and is customizable so it fits your needs.

## Setup

Install dependencies:

`npm ci`

Copy dev config file and set your personal GitLab token in it:

`npm run copy-config:setup`

To build prod:

`npm run build:prod && npm run zip`

## Assets and Documentation

-   Neutrino https://neutrinojs.org/
-   Neutrino for WebExtensions https://github.com/crimx/neutrino-webextension
-   React https://reactjs.org/docs
-   Primer Components https://primer.style/components/
-   Octoicons https://octicons.github.com/
-   Mozilla Documentation for WebExtensions https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions

## Maintainer

| [![twitter/mikescops](https://avatars0.githubusercontent.com/u/4266283?s=100&v=4)](https://pixelswap.fr 'Personal Website') |
| --------------------------------------------------------------------------------------------------------------------------- |
| [Corentin Mors](https://pixelswap.fr/)                                                                                      |

## Contributors (thanks for your help!)

| [Paola Ducolin](https://github.com/pducolin) | [Bradley Cushing](https://github.com/bradcush) |
| -------------------------------------------- | ---------------------------------------------- |

