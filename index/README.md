# Islamic Learning Library — redesigned page

This is a drop-in redesign of the supplied `learndec.html` and `learn.css`.

## Files

- `learndec.html` — 41 book entries, 30 lecture placeholders, search, categories, and accessible viewers.
- `learn.css` — all desktop, tablet and mobile styles; no external fonts or images.
- `library.js` — search, filtering, PDF reading, click-to-load videos and exit actions.

## Add it to the existing website

1. Back up your current `learndec.html` and `learn.css`.
2. Place these **three files together** in the same directory where your old `learndec.html` was located. Keep their filenames.
3. Keep the PDF folders at their current relative locations. The original `../newpdfs/...` and `../allpdfs/...` links were copied exactly.
4. Open the page through your site's usual web server (or local development server) and test several PDF files.

This page does not need the old `homemobile.css`: responsive styles are part of the new `learn.css`. It does not affect that file elsewhere on your site.

## Performance behavior

- On initial load, **no YouTube iframe, player, thumbnail image or YouTube API request** is created by this page.
- Selecting **Video lectures** shows local CSS-only previews.
- Clicking **Watch lecture** inserts exactly one YouTube iframe using the privacy-enhanced embed host.
- Pressing **Exit** or **Escape** deletes the iframe and stops the video.
- PDF frames are likewise only given a PDF URL when someone presses **Read PDF**. Closing the reader clears the frame.
- On iPhone or iPad, **Read PDF** opens the browser's native PDF viewer in a new tab.

## Important notes

- The PDF files themselves were not included in the supplied attachments. Their paths are preserved, but verify that your hosting has those files in the expected directories.
- As with any normal `<a download>` link, some mobile browsers might open a PDF and offer it through a sharing or save menu.
- Because this is a local static page, adding new book entries later involves editing its HTML. No database or backend is required.
- The original explanatory paragraphs are included within each book's **About this publication** expandable panel.

## Recommended deployment check

Test one PDF from each folder (`newpdfs`, `allpdfs/tawheed`, `allpdfs/introduction`, `allpdfs/aqeedah`, and `allpdfs/fiqh`), try a lecture and close it, search for an Arabic and English book title, and open the page on a phone.
