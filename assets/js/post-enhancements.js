document.addEventListener('DOMContentLoaded', function () {
  normalizePostContentHeading();
  initializeDesktopTocOffset();
  initializeDesktopTocBoundary();
  initializePostToc();
  initializeCodeCopyButtons();
});

function normalizePostContentHeading() {
  var article = document.querySelector('.post-content');
  var pageTitle = document.querySelector('.post-title');

  if (!article || !pageTitle) {
    return;
  }

  var firstHeading = article.querySelector('h1');
  var normalizedPageTitle = (pageTitle.textContent || '').trim().toLowerCase();

  if (!firstHeading) {
    return;
  }

  if ((firstHeading.textContent || '').trim().toLowerCase() === normalizedPageTitle) {
    firstHeading.remove();
  }
}

function initializeDesktopTocOffset() {
  var desktopToc = document.querySelector('.post-toc--desktop');
  var postHeader = document.querySelector('.post-header');
  var siteHeader = document.querySelector('.site-header');

  if (!desktopToc || !postHeader) {
    return;
  }

  function setOffset() {
    var siteHeaderHeight = siteHeader ? siteHeader.offsetHeight : 56;
    var postHeaderHeight = postHeader.offsetHeight;
    var tocTop = Math.max(255, siteHeaderHeight + postHeaderHeight + 20);

    document.documentElement.style.setProperty('--post-toc-top', tocTop + 'px');
  }

  setOffset();
  window.addEventListener('resize', setOffset);
}

function initializeDesktopTocBoundary() {
  var desktopToc = document.querySelector('.post-toc--desktop');
  var articleEnd = document.querySelector('.author-bio') ||
    document.querySelector('.post-footer') ||
    document.querySelector('.post-wrapper-with-toc');

  if (!desktopToc || !articleEnd) {
    return;
  }

  var endObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      desktopToc.classList.toggle('is-hidden-at-end', entry.isIntersecting);
    });
  }, {
    threshold: 0
  });

  endObserver.observe(articleEnd);
}

function initializePostToc() {
  var article = document.querySelector('.post-content');
  var tocWrapper = document.querySelector('.post-wrapper-with-toc');
  var tocSidebar = document.querySelector('.toc-sidebar');
  var tocContainers = Array.prototype.slice.call(document.querySelectorAll('[data-toc-container]'));

  if (!article || tocContainers.length === 0) {
    return;
  }

  var headings = Array.prototype.slice.call(article.querySelectorAll('h2, h3'))
    .filter(function (heading) {
      return (heading.textContent || '').trim().length > 0;
    });

  if (headings.length === 0) {
    if (tocWrapper) {
      tocWrapper.classList.add('post-wrapper-with-toc--no-toc');
    }

    if (tocSidebar) {
      tocSidebar.hidden = true;
    }

    tocContainers.forEach(function (container) {
      container.hidden = true;
    });

    return;
  }

  if (tocWrapper) {
    tocWrapper.classList.remove('post-wrapper-with-toc--no-toc');
  }

  if (tocSidebar) {
    tocSidebar.hidden = false;
  }

  var entries = headings.map(function (heading, index) {
    if (!heading.id) {
      heading.id = createHeadingId(heading.textContent, index);
    }

    return {
      id: heading.id,
      level: heading.tagName.toLowerCase(),
      text: heading.textContent.trim()
    };
  });

  var allLinks = [];

  tocContainers.forEach(function (container) {
    var list = container.querySelector('[data-toc-list]');
    if (!list) {
      return;
    }

    list.innerHTML = '';

    entries.forEach(function (entry) {
      var item = document.createElement('li');
      item.className = 'post-toc__item post-toc__item--' + entry.level;

      var link = document.createElement('a');
      link.className = 'post-toc__link';
      link.href = '#' + entry.id;
      link.dataset.target = entry.id;
      link.textContent = entry.text;

      link.addEventListener('click', function (event) {
        event.preventDefault();
        var target = document.getElementById(entry.id);

        if (!target) {
          return;
        }

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        history.replaceState(null, '', '#' + entry.id);
      });

      item.appendChild(link);
      list.appendChild(item);
      allLinks.push(link);
    });

    container.hidden = false;
  });

  var activeId = entries[0].id;

  function setActive(id) {
    activeId = id;
    allLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.target === id);
    });
  }

  setActive(activeId);

  var observer = new IntersectionObserver(
    function (observerEntries) {
      var visible = observerEntries
        .filter(function (entry) {
          return entry.isIntersecting;
        })
        .sort(function (left, right) {
          if (left.boundingClientRect.top === right.boundingClientRect.top) {
            return headings.indexOf(left.target) - headings.indexOf(right.target);
          }

          return left.boundingClientRect.top - right.boundingClientRect.top;
        });

      if (visible.length > 0) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: '-120px 0px -55% 0px',
      threshold: [0, 1]
    }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });
}

function createHeadingId(text, index) {
  var slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (!slug) {
    slug = 'section-' + (index + 1);
  }

  var uniqueSlug = slug;
  var counter = 2;

  while (document.getElementById(uniqueSlug)) {
    uniqueSlug = slug + '-' + counter;
    counter += 1;
  }

  return uniqueSlug;
}

function initializeCodeCopyButtons() {
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.code-copy-button'));

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var wrapper = button.closest('.code-block-wrapper');
      var tooltip = wrapper ? wrapper.querySelector('.code-copy-tooltip') : null;
      var lines = wrapper ? wrapper.querySelectorAll('.shiki .line') : [];
      var text = Array.prototype.map.call(lines, function (line) {
        return line.textContent;
      }).join('\n');

      if (!text) {
        return;
      }

      navigator.clipboard.writeText(text).then(function () {
        if (!tooltip) {
          return;
        }

        tooltip.classList.add('is-visible');
        window.clearTimeout(button._copyTimeoutId);
        button._copyTimeoutId = window.setTimeout(function () {
          tooltip.classList.remove('is-visible');
        }, 1400);
      });
    });
  });
}
