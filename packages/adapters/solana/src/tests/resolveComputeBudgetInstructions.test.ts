import { ComputeBudgetProgram, TransactionInstruction, VersionedTransaction } from '@solana/web3.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveComputeBudgetInstructions } from '../utils/resolveComputeBudgetInstructions'
import { mockConnection } from './mocks/Connection'
import { TestConstants } from './util/TestConstants'

const feePayer = TestConstants.accounts[0].publicKey
const dummyInstruction = new TransactionInstruction({
  programId: TestConstants.accounts[1].publicKey,
  keys: [],
  data: Buffer.from([])
})

let connection = mockConnection()

describe('resolveComputeBudgetInstructions', () => {
  beforeEach(() => {
    connection = mockConnection()
  })

  it('sizes the unit limit to simulated CU usage plus margin when simulation succeeds', async () => {
    connection.simulateTransaction = vi.fn().mockResolvedValue({
      value: { err: null, unitsConsumed: 5000 }
    })

    const instructions = await resolveComputeBudgetInstructions({
      connection,
      instructions: [dummyInstruction],
      feePayer,
      fallbackUnitLimit: 99999
    })

    const limitInstruction = instructions[1]
    const expected = ComputeBudgetProgram.setComputeUnitLimit({ units: Math.ceil(5000 * 1.3) })
    expect(limitInstruction?.data.equals(expected.data)).toBe(true)
  })

  it('falls back to the static limit when simulation throws', async () => {
    connection.simulateTransaction = vi.fn().mockRejectedValue(new Error('RPC down'))

    const instructions = await resolveComputeBudgetInstructions({
      connection,
      instructions: [dummyInstruction],
      feePayer,
      fallbackUnitLimit: 42000
    })

    const limitInstruction = instructions[1]
    const expected = ComputeBudgetProgram.setComputeUnitLimit({ units: 42000 })
    expect(limitInstruction?.data.equals(expected.data)).toBe(true)
  })

  it('falls back to the static limit when simulation reports an instruction error', async () => {
    connection.simulateTransaction = vi.fn().mockResolvedValue({
      value: { err: { InstructionError: [0, 'ProgramFailedToComplete'] }, unitsConsumed: 0 }
    })

    const instructions = await resolveComputeBudgetInstructions({
      connection,
      instructions: [dummyInstruction],
      feePayer,
      fallbackUnitLimit: 42000
    })

    const limitInstruction = instructions[1]
    const expected = ComputeBudgetProgram.setComputeUnitLimit({ units: 42000 })
    expect(limitInstruction?.data.equals(expected.data)).toBe(true)
  })

  it('always leads with the configured priority fee price instruction', async () => {
    connection.simulateTransaction = vi.fn().mockResolvedValue({
      value: { err: null, unitsConsumed: 1000 }
    })

    const instructions = await resolveComputeBudgetInstructions({
      connection,
      instructions: [dummyInstruction],
      feePayer,
      fallbackUnitLimit: 1
    })

    const priceInstruction = instructions[0]
    const expected = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 20000000 })
    expect(priceInstruction?.data.equals(expected.data)).toBe(true)
  })

  it('simulates the exact final instruction shape, including the price instruction', async () => {
    let simulatedInstructionCount: number | undefined

    connection.simulateTransaction = vi
      .fn()
      .mockImplementation((versionedTransaction: VersionedTransaction) => {
        simulatedInstructionCount = versionedTransaction.message.compiledInstructions.length

        return Promise.resolve({ value: { err: null, unitsConsumed: 5000 } })
      })

    await resolveComputeBudgetInstructions({
      connection,
      instructions: [dummyInstruction],
      feePayer,
      fallbackUnitLimit: 99999
    })

    // price + limit + the one real instruction passed in
    expect(simulatedInstructionCount).toBe(3)
  })

  it('simulates the exact final instruction shape for multiple real instructions (e.g. ATA creation + transfer)', async () => {
    let simulatedInstructionCount: number | undefined

    connection.simulateTransaction = vi
      .fn()
      .mockImplementation((versionedTransaction: VersionedTransaction) => {
        simulatedInstructionCount = versionedTransaction.message.compiledInstructions.length

        return Promise.resolve({ value: { err: null, unitsConsumed: 18000 } })
      })

    await resolveComputeBudgetInstructions({
      connection,
      instructions: [dummyInstruction, dummyInstruction],
      feePayer,
      fallbackUnitLimit: 99999
    })

    // price + limit + the two real instructions passed in
    expect(simulatedInstructionCount).toBe(4)
  })
})
