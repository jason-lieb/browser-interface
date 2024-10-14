export type Tab = {
  favIconUrl: string | undefined
  title: string | undefined
  url: string
}

type TabWithUrl = Omit<chrome.tabs.Tab, 'url'> & {url: string}

export function formatTabs(tabs: chrome.tabs.Tab[]): Tab[] {
  return (tabs.filter(tab => tab.url !== undefined) as TabWithUrl[])
    .filter(tab => tab.url.split('://')[0] !== 'chrome-extension')
    .map(formatTab)
}

function formatTab(tab: TabWithUrl): Tab {
  const {favIconUrl, title: rawTitle, url} = tab
  const title = rawTitle?.replace(/\|/g, '/')
  return {
    favIconUrl,
    title,
    url,
  }
}
