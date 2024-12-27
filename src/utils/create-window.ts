import {catchError, labelError, throwError} from './error'
import {TabT} from './format-tabs'

export async function createWindowWithTabs(tabs: TabT[]) {
  if (tabs.length === 0) return

  const {data: window, error} = await catchError(chrome.windows.create({focused: true}))
  if (error) throw new Error(`createWindowWithTabsError: ${error}`)

  await Promise.all(
    tabs.map((tab, index) =>
      chrome.tabs
        .create({
          windowId: window.id,
          url: tab.url,
          active: index === 0,
        })
        .catch(labelError(`Error creating tab ${index}`))
    )
  )

  if (window.tabs === undefined || window.tabs[0].id === undefined)
    throw new Error(
      'createWindowWithTabsError: window.tabs is undefined or window.tabs[0].id is undefined'
    )

  chrome.tabs.remove(window.tabs[0].id).catch(throwError('Error removing tab'))
}
