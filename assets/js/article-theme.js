(function () {
  var root = document.documentElement;
  var button = document.querySelector('.theme-toggle');
  var preference = window.matchMedia('(prefers-color-scheme: dark)');
  var saved;
  try { saved = localStorage.getItem('bazlur-theme'); } catch (error) {}

  function apply(dark) {
    root.dataset.theme = dark ? 'dark' : 'light';
    button.textContent = dark ? 'Light' : 'Dark';
    button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (!button) return;
  apply(root.dataset.theme === 'dark');
  button.addEventListener('click', function () {
    var dark = root.dataset.theme !== 'dark';
    saved = dark ? 'dark' : 'light';
    try { localStorage.setItem('bazlur-theme', saved); } catch (error) {}
    apply(dark);
  });
  preference.addEventListener('change', function (event) {
    if (saved !== 'light' && saved !== 'dark') apply(event.matches);
  });
})();
