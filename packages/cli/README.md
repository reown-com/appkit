# Reown AppKit CLI

**AppKit CLI** is a command-line tool to fast download a funcionaly boilerplate example for Reown Web AppKit SDK.

## Installation

To install this CLI tool globally for development, you can link it locally using the following commands.

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Clone the Repository

First, clone this repository to your local machine:

```bash
git clone https://github.com/reown-com/appkit-cli
cd appkit-cli
```

### Local Installation

To test the CLI locally, use `npm link`. This allows you to run the CLI from any location on your machine.

```bash
npm install
sudo npm link
```

## Usage

Once linked, you can use the CLI globally by running:

```bash
appkit-cli
```

Also you can run it directly:

```bash
npx appkit-cli
```

### Example Commands

Provide examples of some paramaeters:

```bash
appkit-cli [project-name]
```

For example:

```bash
appkit-cli my-app
appkit-cli
```

## Linking/Unlinking for Local Development

### Linking

If you want to work on the CLI and test it locally without publishing, use `npm link`:

1. **Navigate to the Project Directory**:

   ```bash
   cd path/to/appkit-cli
   ```

2. **Run npm link**:
   ```bash
   sudo npm link
   ```

### Unlinking

To remove the symlink and unlink the CLI, use:

```bash
sudo npm unlink -g
```

This will unregister the global command `appkit-cli`, but it won’t delete any files in your project directory.

### Quick Demo

https://github.com/user-attachments/assets/6c4fbdc3-c0ca-4edd-a730-20cfee878c86
