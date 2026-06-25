/* ── Opinions blog — reads from assets/data/articles.json ── */

var TAG_CLASSES = {
  memo:    'tag-memo',
  essay:   'tag-essay',
  article: 'tag-article'
};

var TAG_LABELS = {
  memo:    'Memo',
  essay:   'Essay',
  article: 'Article'
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildArticleHTML(article) {
  var tagClass = TAG_CLASSES[article.tag] || 'tag-article';
  var tagLabel = TAG_LABELS[article.tag] || article.tag;
  var arrow = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>';

  return '<article class="blog-item" data-tag="' + article.tag + '">'
    + '<div class="blog-main">'
    + '<span class="tag ' + tagClass + '">' + tagLabel + '</span>'
    + '<h2 class="blog-title">' + escapeHTML(article.title) + '</h2>'
    + '<p class="blog-excerpt">' + escapeHTML(article.excerpt) + '</p>'
    + '<div class="blog-meta">'
    + '<span class="blog-date">' + formatDate(article.date) + '</span>'
    + (article.venue ? '<span class="blog-venue">' + escapeHTML(article.venue) + '</span>' : '')
    + '</div>'
    + '</div>'
    + '<a class="blog-arrow" href="' + article.url + '"'
    + (article.external ? ' target="_blank" rel="noopener"' : '')
    + ' aria-label="Read article">' + arrow + '</a>'
    + '</article>';
}

var allArticles = [];
var activeFilter = 'all';

function renderArticles() {
  var list  = document.getElementById('blog-list');
  var empty = document.getElementById('blog-empty');
  if (!list) return;

  var sorted = allArticles.slice().sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  var filtered = activeFilter === 'all'
    ? sorted
    : sorted.filter(function(a) { return a.tag === activeFilter; });

  if (!filtered.length) {
    list.style.display  = 'none';
    empty.style.display = '';
    return;
  }

  list.innerHTML = filtered.map(buildArticleHTML).join('');
  list.style.display  = '';
  empty.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  var loading = document.getElementById('blog-loading');

  fetch('assets/data/articles.json?v=' + Date.now())
    .then(function(res) {
      if (!res.ok) throw new Error('Could not load articles (' + res.status + ')');
      return res.json();
    })
    .then(function(data) {
      allArticles = data;
      loading.style.display = 'none';
      renderArticles();
    })
    .catch(function(err) {
      loading.textContent = 'Could not load articles: ' + err.message;
      loading.className = 'chart-loading error';
    });

  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      renderArticles();
    });
  });
});
