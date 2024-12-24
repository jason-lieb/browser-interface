import {labelError} from './catch-error'

export function pinTab() {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    if (tabs.length > 0) {
      const tabId = tabs[0].id
      if (tabId !== undefined) {
        chrome.tabs.update(tabId, {pinned: true}).catch(labelError('Error pinning tab'))
      }
    }
  })
}

export function unpinTab() {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    if (tabs.length > 0) {
      const tabId = tabs[0].id
      if (tabId !== undefined) {
        chrome.tabs.update(tabId, {pinned: false}).catch(labelError('Error unpinning tab'))
      }
    }
  })
}
