import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export const nextJsWagmiAppRouterSampleApp = (server: McpServer) =>
  server.tool(
    'AppKit with Next.js App Router Sample App',
    'Get the sample codebase to build app for AppKit with Next.js App Router',
    () => {
      const fs = require('fs')
      const path = require('path')

      const baseDir = '/Users/enesozturk/Desktop/Projects/appkit/examples/next-wagmi-app-router'

      function getAllFiles(dir: string, filePaths: string[] = []): string[] {
        const files = fs.readdirSync(dir)

        files.forEach((file: string) => {
          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)

          if (stat.isDirectory()) {
            // Skip node_modules, dist and .next folders
            if (!['node_modules', 'dist', '.next'].includes(file)) {
              getAllFiles(filePath, filePaths)
            }
          } else {
            // Only include .ts, .tsx and .json files
            if (file.match(/\.(ts|tsx|json)$/)) {
              filePaths.push(path.relative(baseDir, filePath))
            }
          }
        })

        return filePaths
      }

      const filePaths = getAllFiles(baseDir)

      const fileContents = filePaths.map(filePath => {
        const fullPath = path.join(baseDir, filePath)
        try {
          return fs.readFileSync(fullPath, 'utf8')
        } catch (err) {
          console.error(`Error reading file ${fullPath}:`, err)
          return ''
        }
      })
      console.log(fileContents)

      const contents = filePaths.map((filePath, i) => ({
        uri: `file://${path.join(baseDir, filePath)}`,
        text: fileContents[i],
        mimeType: 'text/plain'
      }))
      console.log(contents)

      return {
        content: [
          {
            type: 'text',
            text: `These are the file contents: ${JSON.stringify(contents)}.
            
            # Some Rules

            - The current version of the AppKit packages are 1.7.3 - use this version while installing them. And also check other package versions of the setup from this package.json.
            - While doing setup for another project, don't change the React, Next.js or other versions, only look for AppKit and Wagmi versions. Do not change user's project setup.
            - Use their own importing approach or code writing approach etc.
            - Don't use loose dependencies
            - Don't try to install dependencies or do setup for those other than Wagmi, Appkit, Tanstack etc. 
            - Create a basic example to let user to open Appkit and render address to the screen. 
            - Don't try to create random UI, respect user's current UI and code style.
            - If you're using some hooks, use "use client" directive etc.
            `
          }
        ]
      }
    }
  )
