(function () {
  'use strict';

  var input = document.getElementById('talk-filter');
  if (!input) return;

  var rows = Array.prototype.slice.call(document.querySelectorAll('#ledger-body tr'));
  var count = document.getElementById('ledger-count');
  var empty = document.getElementById('ledger-empty');

  function filterTalks() {
    var query = input.value.trim().toLowerCase();
    var visible = 0;
    var previousYear = null;

    rows.forEach(function (row) {
      row.hidden = query !== '' && row.dataset.search.indexOf(query) === -1;
      if (row.hidden) return;

      visible += 1;
      var year = row.dataset.year;
      row.querySelector('.ledger-year-label').textContent = year === previousYear ? '' : year;
      previousYear = year;
    });

    count.textContent = visible + ' of ' + rows.length + ' sessions';
    empty.hidden = visible !== 0;
  }

  input.addEventListener('input', filterTalks);
  window.addEventListener('pageshow', filterTalks);
  document.querySelector('.ledger-filter').hidden = false;
  filterTalks();
})();
