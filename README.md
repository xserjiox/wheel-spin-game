# Kruti — Random Choice Wheel

Kruti is a lightweight browser game that turns everyday decisions into a colorful wheel of fortune. Add the choices you cannot decide between, start the wheel, and let it select a winner for you.

It works well for choosing food, picking a player or team, selecting a challenge, deciding who goes first, running a small giveaway, or making any other random choice with friends.

## How to Play

1. Enter a name for your wheel.
2. Add at least two options.
3. Choose a spin duration using a preset or enter a custom time from 1 to 300 seconds.
4. Press **Spin the wheel** or use the button in the center of the wheel.
5. Wait for the wheel to stop and reveal the selected option.
6. Spin again whenever you need another result.

## Features

- Custom wheel titles and options
- Add and remove choices at any time before a spin
- Equal probability for every option
- Preset and custom spin durations
- Secure random selection through the browser's Web Crypto API when available
- Animated winner reveal and live countdown
- Automatic local saving of the wheel title and options
- Responsive layout for desktop and mobile screens
- No build tools, accounts, back end, or external JavaScript dependencies

## Fair Selection

Every segment has the same chance of winning:

```text
probability = 100 / number of options
```

The winning option is selected before the animation starts. The wheel then calculates its final rotation so that the chosen segment stops under the pointer. When supported by the browser, Kruti uses `crypto.getRandomValues()` and rejection sampling to avoid modulo bias.

## Run Locally

The game is built with plain HTML, CSS, and JavaScript, so no installation or compilation is required.

You can open `index.html` directly in a browser or start any static file server from the project directory:

```bash
npx serve .
```

Then open the local address shown in the terminal.

## Local Data

The wheel title and option list are stored in the browser's `localStorage`. They remain available after a page reload, but only in the same browser and on the same device. The game continues to work with its default values if local storage is unavailable.

## Project Structure

```text
.
├── index.html   # Page structure and game controls
├── styles.css   # Layout, responsive design, and animations
├── app.js       # Wheel rendering, random selection, and persistence
└── README.md    # Project documentation
```

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API for drawing the wheel
- Web Crypto API for random selection
- Web Storage API for local persistence

## Notes

- At least two options are required to start a spin.
- Option names can contain up to 80 characters.
- Wheel titles can contain up to 60 characters.
- Spin duration is limited to 1–300 seconds.
