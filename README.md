# Obsidian Browser Interface Extension

A chrome extension that pairs with a [obsidian plugin](https://github.com/jason-lieb/obsidian-browser-interface-plugin) to manage your tabs in obsidian.

This extension allows you to save all the tabs in a chrome window in markdown to a folder of your choice. The markdown is designed to be used with the Obsidian Browser Interface Plugin and other Obsidian plugins to display the tabs and reopen or delete them.

### Installation

Until the chrome extension is approved, the only way to install it will be manually building it.

1. Clone this repository to your local machine using `git clone https://github.com/jason-lieb/obsidian-browser-interface-extension.git`.

2. Install the dependencies with `npm i`

3. Build the project with `npm run build`

4. Navigate to the extensions page in your browser (`brave://extensions/`, `chrome://extensions/`, etc).

5. Enable Developer Mode by clicking the toggle switch next to "Developer mode".

6. Click the "Load unpacked" button and select the dist folder inside of the directory.

7. The extension should now be installed and visible in your extensions list.

### Screenshot
![chrome extension screenshot](screenshot.png)
