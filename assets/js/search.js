(function () {
  'use strict';
  const form = document.getElementById('article-search');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  const filter = document.getElementById('search-filter');
  let articles;
  let topic = '';
  let timer;

  try {
    articles = JSON.parse(document.getElementById('search-data').textContent).map(article => ({
      ...article,
      tags: article.tags || [],
      text: (article.title + ' ' + (article.categories || []).join(' ') + ' ' + (article.tags || []).join(' ') + ' ' + article.content).toLowerCase()
    }));
  } catch (error) {
    status.textContent = 'Search could not load. Please use the article archive or reload this page.';
    return;
  }

  function highlight(text, terms) {
    const fragment = document.createDocumentFragment();
    const lower = text.toLowerCase();
    let offset = 0;
    while (offset < text.length) {
      let index = text.length;
      let match = '';
      terms.forEach(term => {
        const found = lower.indexOf(term, offset);
        if (found !== -1 && found < index) { index = found; match = term; }
      });
      fragment.append(document.createTextNode(text.slice(offset, index)));
      if (!match) break;
      const mark = document.createElement('mark');
      mark.textContent = text.slice(index, index + match.length);
      fragment.append(mark);
      offset = index + match.length;
    }
    return fragment;
  }

  function excerpt(content, terms) {
    const lower = content.toLowerCase();
    const matches = terms.map(term => lower.indexOf(term)).filter(index => index >= 0);
    let start = matches.length ? Math.max(0, Math.min(...matches) - 55) : 0;
    if (start > 0) {
      const space = content.indexOf(' ', start);
      if (space !== -1 && space < start + 30) start = space + 1;
    }
    const end = Math.min(content.length, start + 200);
    return (start ? '…' : '') + content.slice(start, end).trim() + (end < content.length ? '…' : '');
  }

  function render(updateUrl) {
    const query = input.value.trim();
    const terms = [...new Set(query.toLowerCase().split(/\s+/).filter(Boolean))];
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
      window.history.replaceState(null, '', url);
    }
    results.replaceChildren();
    filter.replaceChildren();
    filter.hidden = !topic;
    if (topic) {
      filter.append(document.createTextNode('Topic: ' + topic));
      const clear = document.createElement('a');
      clear.className = 'text-link';
      const url = new URL(window.location.href);
      url.searchParams.delete('tag');
      clear.href = url.pathname + url.search;
      clear.textContent = 'Clear filter';
      filter.append(clear);
    }
    if (!terms.length && !topic) {
      status.textContent = 'Type a few words to search ' + articles.length + ' articles.';
      return;
    }
    const found = articles.filter(article => (!topic || article.tags.some(tag => tag.toLowerCase() === topic.toLowerCase())) && terms.every(term => article.text.includes(term)));
    const score = article => terms.reduce((sum, term) => sum + (article.title.toLowerCase().includes(term) ? 10 : 0) + (article.tags.some(tag => tag.toLowerCase().includes(term)) ? 4 : 0), 0);
    found.sort((a, b) => score(b) - score(a));
    status.textContent = found.length ? found.length + ' article' + (found.length === 1 ? '' : 's') + (query ? ' matching “' + query + '”' : ' on this topic') + '.' : 'No articles found. Try fewer words or a broader topic.';
    const fragment = document.createDocumentFragment();
    found.forEach(article => {
      const item = document.createElement('li');
      const heading = document.createElement('h2');
      const link = document.createElement('a');
      link.href = article.url;
      link.append(highlight(article.title, terms));
      heading.append(link);
      const date = document.createElement('time');
      date.className = 'entry-meta';
      date.dateTime = article.datetime;
      date.textContent = article.date;
      const summary = document.createElement('p');
      summary.append(highlight(excerpt(article.content, terms), terms));
      item.append(heading, date, summary);
      fragment.append(item);
    });
    results.append(fragment);
  }

  function restore() {
    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    topic = params.get('tag') || '';
    render(false);
  }
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); render(true); });
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => render(true), 150); });
  window.addEventListener('popstate', restore);
  restore();
})();
