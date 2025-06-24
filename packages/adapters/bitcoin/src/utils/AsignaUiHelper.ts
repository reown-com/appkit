import * as bitcoin from 'bitcoinjs-lib'

const mergeSignaturesInPsbt = (initialPsbt: string, signatures: any[], owners: any[], network: bitcoin.Network) => {
  const psbt = bitcoin.Psbt.fromBase64(initialPsbt, {network});
  const psbts = signatures.map(value => bitcoin.Psbt.fromBase64(value.signedPsbt, {network}));
  psbt.combine(...psbts);
  const unsignedOwnersIds: string[] = [];
  for (const owner of owners) {
    const index = signatures.findIndex(value => value.ownerId.toString() === owner._id.toString());
    if (index === -1) {
      unsignedOwnersIds.push(owner._id);
    }
  }

  if (unsignedOwnersIds.length > 0) {
    const unsignedOwnerPublicKeys = owners.filter(owner => unsignedOwnersIds.includes(owner._id)).map(value => value.publicKey || '');
    psbt.data.inputs.forEach(i => {
      unsignedOwnerPublicKeys.map(o => {
        if (i.tapScriptSig && i.tapScriptSig.length > 0) {
          i.tapScriptSig.push({
            signature: Buffer.from([]),
            pubkey: toXOnly(Buffer.from(o, 'hex')),
            leafHash: i.tapScriptSig[0]?.leafHash || Buffer.from([]),
          });
        }
      });
    });
  }

  return psbt;
}

const toXOnly = (pubkey: Buffer) => {
  return pubkey.slice(1, 33);
}

export class AsignaUiHelper {
  static createSigningModal(
    mode: 'message' | 'transaction',
    data: any,
    onApprove?: (result: any) => void
  ): { modal: HTMLElement, updateProgress: (current: number, total: number) => void } {
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
      opacity: 1;
      transition: opacity 0.2s ease-in-out;
    `

    const content = document.createElement('div')
    content.className = 'modal-content'
    content.style.cssText = `
      background: white;
      border-radius: 24px;
      padding: 24px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 450px;
      width: 90%;
      transform: scale(1);
      opacity: 1;
      transition: all 0.2s ease-in-out;
    `

    const title = document.createElement('h3')
    title.textContent = mode === 'message' ? 'Sign Message' : 'Sign Transaction'
    title.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    `

    const progressContainer = document.createElement('div')
    progressContainer.style.cssText = `
      margin: 0 0 20px 0;
    `

    const progressText = document.createElement('div')
    progressText.textContent = 'Waiting for signatures...'
    progressText.style.cssText = `
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    `

    const progressBar = document.createElement('div')
    progressBar.style.cssText = `
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    `

    const progressFill = document.createElement('div')
    progressFill.className = 'progress-fill'
    progressFill.style.cssText  = `
      height: 100%;
      background: #3498db;
      width: 0%;
      transition: width 0.3s ease-in-out;
    `

    const signaturesText = document.createElement('div')
    signaturesText.className = 'signatures-text'
    signaturesText.textContent = `0/${data.threshold || 2} signatures collected`
    signaturesText.style.cssText = `
      font-size: 12px;
      color: #9ca3af;
      margin-top: 4px;
    `

    progressBar.appendChild(progressFill)
    progressContainer.appendChild(progressText)
    progressContainer.appendChild(progressBar)
    progressContainer.appendChild(signaturesText)

    const spinner = document.createElement('div')
    spinner.className = 'loading-spinner'
    spinner.style.cssText = `
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    `

    const contentArea = document.createElement('div')
    contentArea.className = 'content-area'
    
    if (mode === 'message') {
      const messageDetails = document.createElement('div')
      messageDetails.style.cssText = `
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        margin: 0 0 20px 0;
        text-align: left;
      `

      const messageLabel = document.createElement('div')
      messageLabel.textContent = 'Message to sign:'
      messageLabel.style.cssText = `
        font-size: 12px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 4px;
      `

      const messageText = document.createElement('div')
      messageText.textContent = data.message || 'Please confirm the signature in your Asigna wallet'
      messageText.style.cssText = `
        font-size: 13px;
        color: #6b7280;
        word-break: break-word;
        line-height: 1.4;
      `

      messageDetails.appendChild(messageLabel)
      messageDetails.appendChild(messageText)
      contentArea.appendChild(messageDetails)
    } else {
      const txDetails = document.createElement('div')
      txDetails.style.cssText = `
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        margin: 0 0 20px 0;
        text-align: left;
      `

      const txLabel = document.createElement('div')
      txLabel.textContent = 'Transaction details:'
      txLabel.style.cssText = `
        font-size: 12px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 4px;
      `

      const txInfo = document.createElement('div')
      
      if (data.psbt) {
        txInfo.textContent = `PSBT: ${data.psbt.substring(0, 20)}...`
      } else if (data.amount && data.recipient) {
        txInfo.textContent = `Amount: ${data.amount} sats\nRecipient: ${data.recipient}`
      } else {
        txInfo.textContent = 'Please confirm the transaction in your Asigna wallet'
      }
      
      txInfo.style.cssText = `
        font-size: 13px;
        color: #6b7280;
        word-break: break-word;
        line-height: 1.4;
        white-space: pre-line;
      `

      txDetails.appendChild(txLabel)
      txDetails.appendChild(txInfo)
      contentArea.appendChild(txDetails)
    }

    const cancelButton = document.createElement('button')
    cancelButton.className = 'cancel-button'
    cancelButton.textContent = 'Cancel'
    cancelButton.style.cssText = `
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    `

    cancelButton.addEventListener('mouseenter', () => {
      cancelButton.style.background = '#e5e7eb'
    })
    cancelButton.addEventListener('mouseleave', () => {
      cancelButton.style.background = '#f3f4f6'
    })

    const approveButton = document.createElement('button')
    approveButton.className = 'approve-button'
    approveButton.textContent = 'Approve'
    approveButton.style.cssText = `
      background: #3498db;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      margin-left: 8px;
      display: none;
    `

    approveButton.addEventListener('mouseenter', () => {
      approveButton.style.background = '#2980b9'
    })
    approveButton.addEventListener('mouseleave', () => {
      approveButton.style.background = '#3498db'
    })

    approveButton.addEventListener('click', () => {
      if (onApprove) {
        if (mode === 'message') {
          const collectedSignatures = data.collectedSignaturesRef?.signatures || []
          const mergedSignature = collectedSignatures.map((sig: any) => sig.signature).join(',')
          onApprove(mergedSignature)
        } else {
          const collectedSignatures = data.collectedSignaturesRef?.signatures || []
          
          if (data.psbt) {
            const owners = data.owners || []
            const network = bitcoin.networks.bitcoin
            
            try {
              const mergedPsbt = mergeSignaturesInPsbt(data.psbt, collectedSignatures, owners, network)
              onApprove({
                psbt: mergedPsbt.toBase64(),
                txid: undefined
              })
            } catch (error) {
              onApprove({
                psbt: data.psbt,
                txid: undefined
              })
            }
          } else {
            const collectedSignatures = data.collectedSignaturesRef?.signatures || []
            const owners = data.owners || []
            const network = bitcoin.networks.bitcoin
            
            try {
              const initialPsbt = data.collectedSignaturesRef?.initialPsbt
              if (initialPsbt) {
                const mergedPsbt = mergeSignaturesInPsbt(initialPsbt, collectedSignatures, owners, network)
                
                const txHex = mergedPsbt.toHex()
                onApprove(txHex)
              } else {
                onApprove('error_no_initial_psbt_found')
              }
            } catch (error) {
              onApprove('error_creating_tx_hex')
            }
          }
        }
      }
    })

    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 8px;
    `

    buttonContainer.appendChild(cancelButton)
    buttonContainer.appendChild(approveButton)

    const style = document.createElement('style')
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .modal-content.show {
        transform: scale(1);
        opacity: 1;
      }
      
      .success-state {
        color: #059669;
      }
      
      .success-state .loading-spinner {
        display: none;
      }
      
      .success-state .approve-button {
        display: inline-block !important;
      }
    `
    document.head.appendChild(style)

    content.appendChild(title)
    content.appendChild(progressContainer)
    content.appendChild(spinner)
    content.appendChild(contentArea)
    content.appendChild(buttonContainer)
    modal.appendChild(content)

    content.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    const updateProgress = (current: number, total: number) => {
      const percentage = (current / total) * 100
      progressFill.style.width = `${percentage}%`
      signaturesText.textContent = `${current}/${total} signatures collected`
      
      if (current >= total) {
        progressText.textContent = 'Signatures gathered successfully!'
        progressText.className = 'success-state'
        content.classList.add('success-state')
        const approveButton = content.querySelector('.approve-button') as HTMLButtonElement
        if (approveButton) approveButton.style.display = 'inline-block'
      }
    }

    return { modal, updateProgress }
  }
} 