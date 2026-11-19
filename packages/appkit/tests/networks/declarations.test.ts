import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { beforeAll, describe, expect, it } from 'vitest'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const NETWORK_ENTRY_FILES = [
  'src/networks/bitcoin.ts',
  'src/networks/solana/index.ts',
  'src/networks/ton/index.ts',
  'src/networks/tron/index.ts',
  'src/networks/stellar/index.ts'
]

function emitNetworkDeclarations() {
  const config = ts.getParsedCommandLineOfConfigFile(
    path.join(packageRoot, 'tsconfig.json'),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined }
  )
  const program = ts.createProgram(
    NETWORK_ENTRY_FILES.map(file => path.join(packageRoot, file)),
    {
      ...config?.options,
      rootDir: packageRoot,
      declaration: true,
      emitDeclarationOnly: true,
      noEmit: false,
      composite: false,
      incremental: false,
      sourceMap: false
    }
  )
  const emitted: Record<string, string> = {}
  program.emit(undefined, (fileName, text) => {
    emitted[fileName.replace(/\\/gu, '/')] = text
  })

  return emitted
}

// Published declarations must point to viem's types, not copy them, or they break on newer viem versions
describe('network declarations', () => {
  let emitted: Record<string, string> = {}
  let networkFiles: string[] = []

  beforeAll(() => {
    emitted = emitNetworkDeclarations()
    networkFiles = Object.keys(emitted).filter(fileName => fileName.includes('/networks/'))
  }, 60_000)

  it('do not copy viem chain fields', () => {
    expect(networkFiles.length).toBeGreaterThan(0)
    for (const fileName of networkFiles) {
      expect(emitted[fileName], fileName).not.toContain('prepareTransactionRequest')
    }
  })

  it('type each network with DefinedCaipNetwork and keep its literal values', () => {
    const solanaFile = networkFiles.find(fileName => fileName.endsWith('/solana/solana.d.ts'))
    const solanaDeclaration = solanaFile ? emitted[solanaFile] : undefined

    expect(solanaDeclaration).toContain('DefinedCaipNetwork<')
    expect(solanaDeclaration).toContain(
      'readonly caipNetworkId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"'
    )
  })

  it('only reference @reown/appkit-common from the defineChain helper', () => {
    const constantFiles = networkFiles.filter(fileName => !fileName.endsWith('/networks/utils.d.ts'))

    expect(constantFiles.length).toBeGreaterThan(0)
    for (const fileName of constantFiles) {
      expect(emitted[fileName], fileName).not.toContain('@reown/appkit-common')
    }
  })
})
