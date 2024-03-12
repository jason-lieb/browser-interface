import {Tab} from './format-data'

type Column =
  | '`BUTTON[browser-interface-extension-open-window]`'
  | 'Tabs'
  | '`BUTTON[browser-interface-extension-open-tab]`'
  | '`BUTTON[browser-interface-extension-delete-tab]`'

export function jsonToMarkdown(tabs: Tab[]): {headers: string; content: string} {
  const columns: Column[] = [
    '`BUTTON[browser-interface-extension-open-window]`',
    'Tabs',
    '`BUTTON[browser-interface-extension-open-tab]`',
    '`BUTTON[browser-interface-extension-delete-tab]`',
  ]

  let headers = '| ' + columns.join(' | ') + ' |'
  headers += '\n| ' + columns.map(() => '---').join(' | ') + ' |\n'

  let content = ''
  for (const tab of tabs) {
    const row = columns.map(extractDataFromTab(tab)).join(' | ')
    content += '| ' + row + ' |\n'
  }

  return {headers, content}
}

function extractDataFromTab(tab: Tab): (header: Column) => string {
  return function(header: Column) {
    switch (header) {
      case '`BUTTON[browser-interface-extension-open-window]`':
        return tab.favIconUrl !== undefined && tab.favIconUrl !== ''
          ? `![favicon](${tab.favIconUrl})`
          : ' '
      case 'Tabs':
        return `[${tab.title ?? ''}](${tab.url})`
      case '`BUTTON[browser-interface-extension-open-tab]`':
        return ' '
      case '`BUTTON[browser-interface-extension-delete-tab]`':
        return ' '
      default:
        throw new Error('Impossible')
    }
  }
}
