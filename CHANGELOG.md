# CHANGELOGS

## 1.2.9
- Sort directories and files in browse page in alphabetical order
- Open links in new tabs
- Make "Manually Run Backup" button have loading state
- Fix parsing errors when there is brackets or parenthesis in a tab's title
- Update Readme

## 1.2.8
- Change timestamp file name and display on frontend

## 1.2.7
- Make backup process create a timestamp file

## 1.2.6
- Fix bug that a pinned tab would get deleted when a new window is created

## 1.2.5
- Use Chrome's Alarm api to prevent the service worker from going inactive and not backing up or opening files
- Request permission on the frontend if permission fails on the backend
- Autofocus input on Save page
- Filter out chrome extension / chrome tabs when saving
- Improved pin tab setting persistence
- Strip incompatible symbols out of file name when saving tabs
- Don't clear save input until the save is finished

## 1.2.4
- Update dependencies and build process

## 1.2.3
- Comment out buggy code that is causing windows with tabs to be deleted

## 1.2.2
- If a tab is detached and it left a browser interface tab by itself, delete the old window
- If a browser interface tab isn't in focus for a minute, it switches back to the save tab
- Clear the save window input on window save

## 1.2.1
- Create setting to pin browser interface tab
- Don't backup files if the only open tabs are chrome / chrome extension tabs
- Create restore backup button on browse page when in the backup directory

## 1.2.0
- Separates app into pages
- Creates browse interface to view saved windows and tabs in the extension
- Rebrands as browser-interface

## 1.1.5
- Change scheduling of backup
- Fix background script missing new backup directories

## 1.1.4
- Change empty value for backup subdirectory from undefined to ''
- Add additional logging to background script

## 1.1.3
- Increase backup frequency for open windows to every 15 minutes
- Fix ability to clear backup directory
- Tweak UI

## 1.1.2
- Fix issue with background script
- Tweak experimental UI

## 1.1.1
- Bug fixes:
  - Fix broken background script
  - Correct order of experimental UI for backup directory
- Tweak experimental UI for backup directory

## 1.1.0
- Create a new feature allowing you to backup open windows

## 1.0.2
- Hashes contents of files and adds to a set to prevent files from being opened multiple times

## 1.0.1
- Update failure behavior to automatically clear directory if permissions are missing

## 1.0.0
- Release to match version with obsidian browser interface plugin.

- Updates include:
  - Autofocus input on page open
  - Hit enter to save window
