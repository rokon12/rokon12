(function () {
  'use strict';
  const archive = document.getElementById('article-archive');
  if (!archive) return;

  const filters = document.getElementById('archive-filters');
  const buttons = [...filters.querySelectorAll('[data-filter]')];
  const years = [...archive.querySelectorAll('[data-archive-year]')];
  const items = years.flatMap(year => [...year.querySelectorAll('.article-list > li')]);
  const status = document.getElementById('archive-status');
  const seriesFilter = document.getElementById('archive-series-filter');
  const empty = document.getElementById('archive-empty');
  const topics = new Map(buttons.map(button => [button.dataset.filter, button.textContent]));
  const seriesTitles = new Map(items.filter(item => item.dataset.series).map(item => [item.dataset.series, item.dataset.seriesTitle]));

  function restore() {
    const url = new URL(window.location.href);
    let topic = url.searchParams.get('topic') || '';
    let series = url.searchParams.get('series') || '';
    let corrected = false;
    if (!topics.has(topic)) { topic = ''; url.searchParams.delete('topic'); corrected = true; }
    if (series && !seriesTitles.has(series)) { series = ''; url.searchParams.delete('series'); corrected = true; }
    if (corrected) window.history.replaceState(null, '', url);

    let count = 0;
    items.forEach(item => {
      item.hidden = Boolean((topic && item.dataset.topic !== topic) || (series && item.dataset.series !== series));
      if (!item.hidden) count++;
    });
    years.forEach(year => { year.hidden = !year.querySelector('.article-list > li:not([hidden])'); });
    buttons.forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.filter === topic)); });
    const qualifiers = [topic ? topics.get(topic) : '', series ? seriesTitles.get(series) : ''].filter(Boolean);
    status.textContent = count + ' article' + (count === 1 ? '' : 's') + (qualifiers.length ? ' in ' + qualifiers.join(' · ') : ' since ' + archive.dataset.startYear) + '.';
    empty.hidden = count !== 0;
    seriesFilter.replaceChildren();
    seriesFilter.hidden = !series;
    if (series) {
      seriesFilter.append(document.createTextNode('Series: ' + seriesTitles.get(series) + ' · '));
      const clear = document.createElement('a');
      url.searchParams.delete('series');
      clear.href = url.pathname + url.search;
      clear.textContent = 'All series';
      seriesFilter.append(clear);
    }
  }

  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;
    const url = new URL(window.location.href);
    if (button.dataset.filter) url.searchParams.set('topic', button.dataset.filter);
    else url.searchParams.delete('topic');
    window.history.pushState(null, '', url);
    restore();
  });
  window.addEventListener('popstate', restore);
  restore();
  filters.hidden = false;
})();
