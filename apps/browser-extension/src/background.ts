const INPAGE_ID = 'inpage'

export async function handleSetupInpage() {
  const registeredContentScripts = await chrome.scripting.getRegisteredContentScripts()

  const inpageRegisteredContentScript = registeredContentScripts.find(({ id }) => id === INPAGE_ID)

  try {
    if (!inpageRegisteredContentScript) {
      chrome.scripting.registerContentScripts([
        {
          id: INPAGE_ID,
          matches: ['file://*/*', 'http://*/*', 'https://*/*'],
          js: ['inpage.js'],
          runAt: 'document_start',
          world: 'MAIN'
        }
      ])
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('failed to register content scripts', e)
  }
}

handleSetupInpage()
