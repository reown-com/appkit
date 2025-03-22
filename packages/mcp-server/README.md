# AppKit MCP Server

A Model Context Protocol (MCP) server that let your AI applications communicate with your wallet and any onchain data with AppKit API.

## Overview

This MCP server extends any MCP client's capabilities by providing tools to do anything on Base:

- Get wallet addresses
- List wallet balances on any network
- Send tokens between wallets
- Swap tokens
- Buy tokens
- Get your transaction history on any network
- ENS lookup
- ENS reverse lookup
- Get gas price of any network

and more.

## Installation

TBD

## Development

This package uses few other packages in this monorepo. Firstly, make sure you've installed and built all the packages as expected.

Run the following command on the root of the project to build all packages and start watching for changes:

```sh
pnpm i; pnpm build; pnpm watch;
```

Then switch to another terminal to run MCP Server locally:

```sh
cd packages/mcp-server;
pnpm dev;
```

This will run the MCP Server locally on port 3000.

To test your MCP Server, run the following command to use MCP Server Inspector:

```sh
pnpm inspect;
```

This will run an inspector app on port 5174. Navigate there and connect to your server with the following settings:

**Type**: SSE
**URL**: http://localhost:3000/sse

Then click `Connect`. When you connect to your screen in the UI, you can list the available tools and test them with given parameters.

## Environment Variables

To make the AppKit MCP work, you need a Reown API token for AppKit's API. Visit https://cloud.reown.com to get your token.

Save your env variable in `.env`:

```sh
REOWN_PROJECT_ID=YOUR_TOKEN
```

## Example Client

To feel the best chat experience with AppKit MCP, we have built MCP client application with nice chat UI. Visit `apps/appkit-chat` to run it.

In another terminal, run the following commands to run AppKit Chat application.

```sh
cd apps/appkit-chat;
pnpm dev;
```

Visit `.env.example` file to fill environment variables.

## License

[Apache License](../../LICENSE)
