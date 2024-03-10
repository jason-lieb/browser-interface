import {Tab} from './format-data'

type Column = '`BUTTON[browser-interface-extension-open-window]`' | 'Tabs' | 'Open' | 'Delete'

export function jsonToMarkdown(tabs: Tab[]): {headers: string; content: string} {
  const columns: Column[] = [
    '`BUTTON[browser-interface-extension-open-window]`',
    'Tabs',
    'Open',
    'Delete',
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
        return `![favicon](${tab.favIconUrl})`
      case 'Tabs':
        return `[${tab.title ?? ''}](${tab.url})`
      case 'Open':
        return '`BUTTON[browser-interface-extension-open-tab]`'
      case 'Delete':
        return '`BUTTON[browser-interface-extension-delete-tab]`'
      default:
        throw new Error('Impossible')
    }
  }
}
