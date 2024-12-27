import {catchError, labelError, throwError} from './error'
import {TabT} from './format-tabs'

export async function createWindowWithTabs(tabs: TabT[]) {
  if (tabs.length === 0) return

  const {data: newWindow, error} = await catchError(chrome.windows.create({focused: true}))
  if (error) throw new Error(`createWindowWithTabsError: ${error}`)

  await Promise.all(
    tabs.map((tab, index) =>
      chrome.tabs
        .create({
          windowId: newWindow.id,
          url: tab.url,
          active: index === 0,
        })
        .catch(labelError(`Error creating tab ${index}`))
    )
  )

  if (newWindow.id === undefined)
    throw new Error('createWindowWithTabsError: window.id is undefined')

  const {data: window, error: windowError} = await catchError(
    chrome.windows.get(newWindow.id, {populate: true})
  )
  if (windowError) throw new Error(`createWindowWithTabsError: ${windowError}`)

  const newTab = window?.tabs?.find(tab => tab.pendingUrl === 'chrome://newtab/')?.id
  if (newTab === undefined) return
  chrome.tabs.remove(newTab).catch(throwError('Error removing tab'))
}
