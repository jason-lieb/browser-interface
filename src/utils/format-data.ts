export type Tab = {
  favIconUrl: string | undefined
  title: string | undefined
  url: string | undefined
}

export function formatTabs(tabs: chrome.tabs.Tab[]): Tab[] {
  return tabs?.filter(tab => tab.url?.split('://')[0] !== 'chrome-extension').map(formatTab)
}

function formatTab(tab: chrome.tabs.Tab): Tab {
  const {favIconUrl, title, url} = tab
  return {
    favIconUrl,
    title,
    url,
  }
}
