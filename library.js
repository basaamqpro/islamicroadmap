/* No network requests or YouTube iframes are created until a visitor clicks. */
(() => {
  'use strict';

  const search = document.getElementById('library-search');
  const booksPanel = document.getElementById('books-panel');
  const videosPanel = document.getElementById('videos-panel');
  const bookFilters = document.getElementById('book-filters');
  const videoFilters = document.getElementById('video-filters');
  const resultCount = document.getElementById('result-count');
  const emptyState = document.getElementById('empty-state');
  const tabs = [...document.querySelectorAll('[data-mode]')];

  let mode = 'books';
  let filter = 'all';
  let lastFocused = null;

  function renderCatalog() {
    const term = search.value.trim().toLocaleLowerCase();
    const panel = mode === 'books' ? booksPanel : videosPanel;
    const cards = [...panel.querySelectorAll('[data-search]')];
    let visible = 0;
    for (const card of cards) {
      const inCategory = filter === 'all' || card.dataset.category === filter;
      const matches = !term || card.dataset.search.includes(term);
      card.hidden = !inCategory || !matches;
      if (!card.hidden) visible++;
    }
    resultCount.textContent = `Showing ${visible} ${mode === 'books' ? 'book' : 'lecture'}${visible === 1 ? '' : 's'}`;
    emptyState.hidden = visible > 0;
    emptyState.textContent = `No matching ${mode === 'books' ? 'books' : 'lectures'}. Try another title or subject.`;
  }

  function chooseMode(next) {
    mode = next;
    filter = 'all';
    booksPanel.hidden = mode !== 'books';
    videosPanel.hidden = mode !== 'videos';
    bookFilters.hidden = mode !== 'books';
    videoFilters.hidden = mode !== 'videos';
    for (const tab of tabs) {
      const selected = tab.dataset.mode === mode;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const group of [bookFilters, videoFilters]) {
      for (const chip of group.querySelectorAll('[data-filter]')) {
        const selected = chip.dataset.filter === 'all';
        chip.classList.toggle('is-active', selected);
        chip.setAttribute('aria-pressed', String(selected));
      }
    }
    search.placeholder = mode === 'books'
      ? 'Search titles, authors, or topics…'
      : 'Search lectures, speakers, or topics…';
    renderCatalog();
  }

  tabs.forEach(tab => tab.addEventListener('click', () => chooseMode(tab.dataset.mode)));
  document.querySelector('.tabs').addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = mode === 'books' ? 'videos' : 'books';
    chooseMode(next);
    tabs.find(t => t.dataset.mode === next).focus();
  });

  for (const group of [bookFilters, videoFilters]) {
    group.addEventListener('click', event => {
      const chip = event.target.closest('[data-filter]');
      if (!chip) return;
      filter = chip.dataset.filter;
      for (const candidate of group.querySelectorAll('[data-filter]')) {
        const selected = candidate === chip;
        candidate.classList.toggle('is-active', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      }
      renderCatalog();
    });
  }
  search.addEventListener('input', renderCatalog);

  const pdfViewer = document.getElementById('pdf-viewer');
  const pdfFrame = document.getElementById('pdf-frame');
  const pdfClose = document.getElementById('pdf-close');
  const pdfNewTab = document.getElementById('pdf-new-tab');
  const pdfDownload = document.getElementById('pdf-download');
  const pdfTitle = document.getElementById('pdf-viewer-title');

  const videoViewer = document.getElementById('video-viewer');
  const videoEmbed = document.getElementById('video-embed');
  const videoTitle = document.getElementById('video-viewer-title');
  const videoClose = document.getElementById('video-close');

  function mobileAppleBrowser() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function openPdf(button) {
    const path = button.dataset.openPdf;
    const title = button.closest('.book-card').querySelector('h3').textContent;
    if (mobileAppleBrowser()) {
      // Native viewing is more reliable on iPhones/iPads. Nothing embeds in the page.
      window.open(path, '_blank', 'noopener,noreferrer');
      return;
    }
    lastFocused = button;
    pdfTitle.textContent = title;
    pdfNewTab.href = path;
    pdfDownload.href = path;
    pdfViewer.hidden = false;
    document.body.classList.add('viewer-open');
    pdfFrame.src = path;
    pdfClose.focus();
  }

  function closePdf() {
    pdfViewer.hidden = true;
    // Release the PDF so the old document cannot keep using resources.
    pdfFrame.removeAttribute('src');
    document.body.classList.remove('viewer-open');
    if (lastFocused?.isConnected) lastFocused.focus();
  }

  function openVideo(button) {
    const id = button.dataset.videoId;
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return;
    lastFocused = button;
    videoTitle.textContent = button.dataset.videoTitle || 'Video lecture';
    videoViewer.hidden = false;
    document.body.classList.add('viewer-open');
    // This iframe is the only YouTube resource, and it exists only after a click.
    const frame = document.createElement('iframe');
    frame.title = videoTitle.textContent;
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    videoEmbed.replaceChildren(frame);
    videoClose.focus();
  }

  function closeVideo() {
    videoViewer.hidden = true;
    // Removing the iframe stops playback and frees the embedded player.
    videoEmbed.replaceChildren();
    document.body.classList.remove('viewer-open');
    if (lastFocused?.isConnected) lastFocused.focus();
  }

  document.addEventListener('click', event => {
    const pdfButton = event.target.closest('[data-open-pdf]');
    if (pdfButton) openPdf(pdfButton);
    const videoButton = event.target.closest('[data-video-id]');
    if (videoButton) openVideo(videoButton);
  });
  pdfClose.addEventListener('click', closePdf);
  videoClose.addEventListener('click', closeVideo);
  videoViewer.addEventListener('click', event => {
    if (event.target === videoViewer || event.target.classList.contains('video-viewer-center')) closeVideo();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!videoViewer.hidden) closeVideo();
      else if (!pdfViewer.hidden) closePdf();
    }
  });

  // Keep keyboard tabbing inside an open reader/player until it is closed.
  for (const dialog of [pdfViewer, videoViewer]) {
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('a[href],button:not([disabled]),iframe')]
        .filter(element => element.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
  }

  chooseMode('books');
})();
