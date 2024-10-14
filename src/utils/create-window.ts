import {Tab} from './format-tabs'

export async function createWindowWithTabs(tabs: Tab[]): Promise<void> {
  if (tabs.length === 0) return

  try {
    const window = await chrome.windows.create({focused: true})

    await Promise.all(
      tabs.map((tab, index) => {
        chrome.tabs.create({
          windowId: window.id,
          url: tab.url,
          active: index === 0,
        })
      })
    )

    if (window.tabs === undefined || window.tabs[0].id === undefined) return
    chrome.tabs.remove(window.tabs[0].id)
  } catch (error) {
    throw new Error(`createWindowWithTabs: ${error}`)
  }
}
