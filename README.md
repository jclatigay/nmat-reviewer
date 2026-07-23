# NMAT Reviewer

NMAT Reviewer is a free study app for the Philippine NMAT. It helps you practice one subtest at a time, review answers, and try timed exam-style sessions.

## What you can do

- Practice 8 subtests:
  - Verbal
  - Inductive Reasoning
  - Quantitative
  - Perceptual Acuity
  - Biology
  - Physics
  - Chemistry
  - Social Science
- Use Study Mode for untimed practice with hints
- Use Exam Mode for timed practice with a 30-minute limit per section
- Review your answers and explanations after each session
- Open the question format guide if you want to add or edit questions

## How to use it

1. Open the app in your browser.
2. Choose a subject.
3. Choose Study Mode or Exam Mode.
4. Answer the questions.
5. Review your score and explanations after you finish.

## Running it on your computer

This app needs to be opened through a local web server. DO N0T open `index.html` directly from your file manager.

If you already have Node.js installed:

```bash
npx serve .
```

If you prefer Python:

```bash
python -m http.server 8080
```

Then open the address shown in the terminal, such as `http://localhost:3000` or `http://localhost:8080`.

## Publishing on GitHub Pages

This repository can be published as a static website on GitHub Pages.

1. Push the repository to GitHub.
2. Open the repository `Settings`.
3. Select `Pages`.
4. Set the source to GitHub Actions, or use the branch-based option if that is what your repo shows.
5. Push to the `main` branch again to trigger deployment.

The deployment workflow is stored in [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

## What is saved

- Your current session is stored in the browser tab using `sessionStorage`.
- This means progress usually stays while the tab is open.
- Closing the tab or browser may clear the session.

## Project files

- [`index.html`](index.html) - main page
- [`css/`](css) - styles
- [`js/`](js) - app logic
- [`data/`](data) - subject and question files
- [`assets/images/`](assets/images) - icons and question figures
- [`docs/question-format.md`](docs/question-format.md) - guide for adding questions

## Adding questions

See [docs/question-format.md](docs/question-format.md) for the question structure and examples.

## Offline use

The app includes a service worker so the main app files can load faster after the first visit. Question data is also cached after it has been loaded, which improves offline use on later visits.

## Disclaimer

This is a personal review tool only. It is not affiliated with CEM or the official NMAT. The sample questions are original and written in NMAT-style formats.
