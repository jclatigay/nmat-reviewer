# Question Format Guide

This guide explains how to add or edit questions in the NMAT Reviewer without changing any application code.

## File locations

Each subtest has its own JSON file in `data/questions/`:

| Subtest | File |
|---------|------|
| Verbal | `verbal.json` |
| Inductive Reasoning | `inductive-reasoning.json` |
| Quantitative | `quantitative.json` |
| Perceptual Acuity | `perceptual-acuity.json` |
| Biology | `biology.json` |
| Physics | `physics.json` |
| Chemistry | `chemistry.json` |
| Social Science | `social-science.json` |

## Top-level structure

```json
{
  "meta": {
    "subtestId": "verbal",
    "subtestName": "Verbal",
    "part": 1,
    "source": "author-seeded",
    "version": "1.0.0",
    "lastUpdated": "2026-07-16",
    "notes": "Your notes here"
  },
  "questions": []
}
```

## Question object fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique stable id, e.g. `"verbal-006"` |
| `number` | Yes | Display order (1, 2, 3 …) |
| `type` | Yes | Item type label for your reference |
| `prompt` | Yes | Question stem. Limited HTML allowed: `<em>`, `<strong>`, `<br>` |
| `passage` | No | Reading passage or shared stimulus (HTML allowed) |
| `image` | No | Path relative to project root, e.g. `"assets/images/hidden-figure-1.svg"` |
| `choices` | Yes | Array of 4–5 options |
| `choices[].id` | Yes | `"A"` through `"E"` |
| `choices[].text` | Yes | Option text |
| `correctChoiceId` | Yes | Must match one choice id |
| `explanation` | Yes | Shown on the Review page after finishing |
| `hint` | No | Study Mode only; shorter than explanation |
| `tags` | No | Optional labels, e.g. `["genetics"]` |

## Example question

```json
{
  "id": "verbal-001",
  "number": 1,
  "type": "word_analogy",
  "prompt": "ARCHITECT : BUILDING :: AUTHOR : ?",
  "passage": null,
  "image": null,
  "choices": [
    { "id": "A", "text": "Library" },
    { "id": "B", "text": "Book" },
    { "id": "C", "text": "Reader" },
    { "id": "D", "text": "Publisher" }
  ],
  "correctChoiceId": "B",
  "explanation": "An architect creates a building; an author creates a book.",
  "hint": "Think: person → thing they create.",
  "tags": ["word_analogy"]
}
```

## Adding a new question

1. Open the subtest JSON file in your editor.
2. Copy an existing question object.
3. Change `id`, `number`, and all content fields.
4. Ensure `number` values are sequential with no duplicates.
5. Save the file and refresh the app in your browser.

## Images

Place image files in `assets/images/` and reference them in the `image` field:

```json
"image": "assets/images/figural-series-1.svg"
```

Supported formats: SVG, PNG, JPG, WebP.

## Tips

- Start with 5–10 questions per subtest and expand toward 30 over time.
- Write **original** questions in NMAT-style formats; do not copy leaked exam items.
- Use `hint` for Study Mode nudges; put full reasoning in `explanation`.
- After editing JSON, serve the app via a local static server (not `file://`) so `fetch()` works.

## Running locally

```bash
# From the project folder
npx serve .
# or
python -m http.server 8080
```

Then open `http://localhost:8080` (or the port shown).
