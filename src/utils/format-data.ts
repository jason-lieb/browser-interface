type Window = {
  alwaysOnTop: boolean
  id: number | undefined
  tabs: Tab[] | undefined
}

type Tab = {
  active: boolean
  favIconUrl: string | undefined
  groupId: number
  id: number | undefined
  index: number
  pinned: boolean
  title: string | undefined
  url: string | undefined
  windowId: number
}

export function formatWindow(window: chrome.windows.Window): Window {
  const {alwaysOnTop, id} = window
  const tabs = window.tabs?.map(formatTab)
  tabs?.pop() // Remove the last tab, which is the Chrome extension tab
  return {
    alwaysOnTop,
    id,
    tabs,
  }
}

function formatTab(tab: chrome.tabs.Tab): Tab {
  const {active, favIconUrl, groupId, id, index, pinned, title, url, windowId} = tab
  return {
    active,
    favIconUrl,
    groupId,
    id,
    index,
    pinned,
    title,
    url,
    windowId,
  }
}
