# Quest-Cord

**Current version: 1.0.0**

A pink-themed Windows desktop companion with a searchable game catalogue and Discord Rich Presence.

## Features

- Searchable starter catalogue of games
- Pink/dark desktop interface built with Python and Tkinter
- Discord Rich Presence through the `pypresence` library
- Set or clear the activity from the app
- Windows executable built with PyInstaller in GitHub Actions

## Build on Windows

1. Install Python 3.12.
2. Run `pip install -r requirements.txt`.
3. Run `python main.py` to start the app.
4. Build an executable with `pyinstaller --noconfirm --clean --onefile --windowed --name Quest-Cord main.py`.

## Build using GitHub Actions

Open **Actions → Build Quest-Cord for Windows → Run workflow**. Download the `Quest-Cord-Windows` artifact after the workflow succeeds.

To publish a GitHub Release, create and push a version tag such as `v0.1.0`. The workflow builds the Windows executable and attaches it to the release automatically.

## Discord setup

1. Create an application in the Discord Developer Portal.
2. Copy its Application ID into Quest-Cord.
3. Keep the Discord desktop application running.
4. Connect and select a game.

Quest-Cord does not ask for your Discord password or token. It does not launch games or verify that a selected game is actually running. The activity is a manually selected Rich Presence status.

## License

MIT
