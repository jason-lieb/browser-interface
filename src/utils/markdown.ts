import {TabT} from './format-tabs'

type Column =
  | '`BUTTON[browser-interface-extension-open-window]`'
  | 'Tabs'
  | '`BUTTON[browser-interface-extension-open-tab]`'
  | '`BUTTON[browser-interface-extension-delete-tab]`'

export function jsonToMarkdown(tabs: TabT[]): {headers: string; content: string} {
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

function extractDataFromTab(tab: TabT): (header: Column) => string {
  return function (header: Column) {
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

export function markdownToJson(markdown: string | ArrayBuffer | null): TabT[] {
  if (markdown === null) return []
  let markdownString: string
  if (markdown instanceof ArrayBuffer) {
    const decoder = new TextDecoder('utf-8')
    markdownString = decoder.decode(markdown)
  } else {
    markdownString = markdown
  }

  const rows = markdownString.split('\n').slice(2)
  const tabs: TabT[] = []

  for (const row of rows) {
    if (row.trim() === '') continue

    const columns = row
      .split('|')
      .map(col => col.trim())
      .slice(1, -1)
    const tab: TabT = {
      favIconUrl: extractFavIconUrl(columns[0]!),
      title: extractTitle(columns[1]!),
      url: extractUrl(columns[1]!),
    }
    tabs.push(tab)
  }

  return tabs
}

function extractFavIconUrl(column: string): string {
  const match = column.match(/!\[favicon\]\((.*?)\)/)
  return match ? match[1]! : ''
}

function extractTitle(column: string): string {
  const match = column.match(/\[(.*?)\]/)
  return match ? match[1]! : ''
}

function extractUrl(column: string): string {
  const match = column.match(/\((.*?)\)/)
  return match ? match[1]! : ''
}
