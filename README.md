# Browser Interface

A chrome extension that optionally pairs with a [obsidian plugin](https://github.com/jason-lieb/obsidian-browser-interface-plugin) to manage your tabs.

This extension allows you to save all the tabs in a chrome window in markdown to a folder of your choice. The markdown is designed to be used with the Obsidian Browser Interface Plugin and other Obsidian plugins to display the tabs and reopen or delete them.

## Use

- Make sure to set the browser flags below.
- Choose a directory on your system to store yours files. You may need to accept permissions the first few times you use the extension.
- Type the file path of where you want to store the window inside the directory. You can create subfolders by using `/` such as `Subfolder / Note Name` (surrounding spaces are allowed).
- Click `Save Window` to close the current window and save it as markdown.
- The feature to backup all open windows works similarly. Create a directory path such as `Backups/Desktop` and the extension will backup all your open windows to that folder every 5 minutes or when you manually backup.

## Installation

It is recommended to install this extension directly from the [chrome web store](https://chromewebstore.google.com/detail/obsidian-browser-interfac/eciohhdfhkkihkiiefldkejohdoghogo). The rest of the instructions under this sub-heading are for how to install and build the project manually.

### Manual Installation

1. Clone this repository to your local machine using `git clone https://github.com/jason-lieb/browser-interface.git`.

2. Install the dependencies with `npm i`

3. Build the project with `npm run build`

4. Navigate to the extensions page in your browser (`brave://extensions/`, `chrome://extensions/`, etc).

5. Enable Developer Mode by clicking the toggle switch next to "Developer mode".

6. Click the "Load unpacked" button and select the dist folder inside of the directory.

7. The extension should now be installed and visible in your extensions list.

### Build a Release

To build and zip the project for distribution with the chrome web store

- Set new versions in `package.json` and `manifest.json`

- Run `npm run build`.

## Browser Compatibility

Brave: go to `brave://flags` and manually enable the following flags:

1. `#file-system-access-api`

2. `#file-system-access-persistant-permission-updated-page-info`

3. `#file-system-observer`

Chrome / Chromium: go to `chrome://flags` and manually enable the following flags:

1. `#file-system-access-persistant-permission-updated-page-info`

2. `#file-system-observer`

## Screenshot
![chrome extension screenshot](screenshot.png)
