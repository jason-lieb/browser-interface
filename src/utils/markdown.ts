import {Tab} from './format-data'

export function jsonToMarkdown(tabs: Tab[]): string {
  const headers = ['`BUTTON[browser-interface-extension]`', 'Tabs']
  let markdown = '| ' + headers.join(' | ') + ' |'

  markdown += '\n| ' + headers.map(() => '---').join(' | ') + ' |\n'

  for (const tab of tabs) {
    const row = headers.map(extractDataFromTab(tab)).join(' | ')
    markdown += '| ' + row + ' |\n'
  }

  return markdown
}

function extractDataFromTab(tab: Tab): (header: string) => string {
  return function(header: string) {
    switch (header) {
      case '`BUTTON[browser-interface-extension]`':
        return `![favicon](${tab.favIconUrl})`
      case 'Tabs':
        return `[${tab.title ?? ''}](${tab.url})`
      default:
        throw new Error('Impossible')
    }
  }
}
