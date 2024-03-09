import {Tab} from './format-data'

export function jsonToMarkdown(tabs: Tab[]): string {
  const headers = [' ', 'Tabs']
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
      case ' ':
        return `![favicon](${tab.favIconUrl})`
      case 'Tabs':
        return `[${tab.title ?? ''}](${tab.url})`
      default:
        return tab[header as keyof Tab] as string
    }
  }
}

// function markdownToJson(markdown: string): Tab[] {
//   const lines = markdown.split('\n').slice(2) // Skip headers
//   const tabs: Tab[] = lines.map(line => {
//     const [favIconUrl, title] = line.slice(1, -2).split(' | ') // Remove leading and trailing pipe characters
//     const url = title.slice(title.indexOf('(') + 1, title.indexOf(')')) // Extract URL from Markdown link
//     const tabTitle = title.slice(title.indexOf('[') + 1, title.indexOf(']')) // Extract title from Markdown link
//     const favicon = favIconUrl.slice(favIconUrl.indexOf('(') + 1, favIconUrl.indexOf(')')) // Extract favicon URL from Markdown image
//     return {
//       favIconUrl: favicon,
//       title: tabTitle,
//       url: url,
//       groupId: -1, // Placeholder value, replace with actual value if available
//       id: -1, // Placeholder value, replace with actual value if available
//       index: -1, // Placeholder value, replace with actual value if available
//       pinned: false, // Placeholder value, replace with actual value if available
//     }
//   })

//   return tabs
// }

// function markdownToJson(markdown: string): Window {
//   const lines = markdown.split('\n')
//   const headers = lines[0].split(' | ')

//   const tabs: Tab[] = lines.slice(2).map(line => {
//     const values = line.split(' | ')
//     const tab: Partial<Tab> = {}
//     headers.forEach((header, index) => {
//       tab[header as keyof Tab] = values[index]
//     })
//     return tab as Tab
//   })

//   return {id: 0, tabs} // Replace 0 with actual window id if available
// }
