/* ── Opinions blog — articles embedded directly ── */

var ARTICLES = [
  {
    "id": "fx-reserve-management-memo",
    "title": "FX Reserve Management and Risk Distortion",
    "tag": "memo",
    "date": "2025-01-01",
    "venue": "Memorandum",
    "excerpt": "How foreign exchange reserve management practices introduce systematic distortions in sovereign risk assessment and market pricing.",
    "url": "https://drive.google.com/file/d/1wN_FcQpD4V7Zv6LveriM3PNzG9BHC5sp/view?usp=drive_link",
    "external": true
  },
  {
    "id": "policy-uncertainty-sp500-memo",
    "title": "Policy Uncertainty & S&P 500 GICS Sector Returns",
    "tag": "memo",
    "date": "2025-02-01",
    "venue": "Investment Memo",
    "excerpt": "An investment memo examining how policy uncertainty transmits across S&P 500 GICS sectors and what it means for sector allocation.",
    "url": "https://drive.google.com/file/d/1OWcS4j-2GJ31u5f4ElbYmLtc_Jh9qOYa/view?usp=drive_link",
    "external": true
  },
  {
    "id": "hedging-diversifying-macro-strategies",
    "title": "Hedging or Diversifying? The Role of Macro Strategies in Traditional Portfolios under Geopolitical Risk",
    "tag": "essay",
    "date": "2025-03-01",
    "venue": "Essay",
    "excerpt": "An examination of how macro strategies function within traditional portfolios amid heightened geopolitical uncertainty \u2014 hedging instrument or diversifier?",
    "url": "https://drive.google.com/file/d/1yFQubJG-OMKo2hNU8WEIJe92Co1J8XD9/view?usp=drive_link",
    "external": true
  },
  {
    "id": "vc-ecosystems-defence",
    "title": "In defence, countries with mature VC ecosystems will outcompete those without",
    "tag": "article",
    "date": "2025-04-01",
    "venue": "The Currency of Change",
    "excerpt": "Why venture capital depth is becoming a decisive factor in defence technology competition between nations.",
    "url": "https://open.substack.com/pub/thecurrencyofchange/p/in-defence-countries-with-mature-ca1?r=1piuwx&utm_campaign=post-expanded-share&utm_medium=web",
    "external": true
  },
  {
    "id": "private-credit-test",
    "title": "Is this the ultimate test for Private Credit?",
    "tag": "article",
    "date": "2025-05-01",
    "venue": "The Currency of Change",
    "excerpt": "Geopolitics, retail redemptions, and the limits of a $2.7 trillion asset class.",
    "url": "https://open.substack.com/pub/thecurrencyofchange/p/is-this-the-ultimate-test-for-private?r=1piuwx&utm_campaign=post-expanded-share&utm_medium=web",
    "external": true
  },
  {
    "id": "oil-rates-gold-iran",
    "title": "Oil, rates and gold: how global markets are pricing in 20 days of war on Iran",
    "tag": "article",
    "date": "2025-06-01",
    "venue": "The Currency of Change",
    "excerpt": "Markets reprice war risk as energy disruption collides with higher-for-longer interest rates.",
    "url": "https://open.substack.com/pub/thecurrencyofchange/p/oil-rates-and-gold-how-global-markets?r=1piuwx&utm_campaign=post-expanded-share&utm_medium=web",
    "external": true
  },
  {
    "id": "nuclear-coming-back",
    "title": "Is Nuclear coming back? Investors are buying its fuel",
    "tag": "article",
    "date": "2025-06-10",
    "venue": "The Currency of Change",
    "excerpt": "AI energy demand, security risk, and private credit are helping nuclear surge again.",
    "url": "https://open.substack.com/pub/thecurrencyofchange/p/is-nuclear-coming-back-investors?r=1piuwx&utm_campaign=post-expanded-share&utm_medium=web",
    "external": true
  },
  {
    "id": "shorting-korean-won",
    "title": "Should you be shorting the Korean Won?",
    "tag": "article",
    "date": "2025-06-15",
    "venue": "The Currency of Change",
    "excerpt": "Everything you need to know about how the Bank of Korea is managing its \"ants\" \u2014 and what it means for the Won.",
    "url": "https://thecurrencyofchange.substack.com/",
    "external": true
  },
  {
    "id": "gold-keeps-shining",
    "title": "The Gold keeps shining \u2014 but is it for the reasons you think?",
    "tag": "article",
    "date": "2025-06-20",
    "venue": "The Currency of Change",
    "excerpt": "A look behind the gold rally \u2014 separating the structural drivers from the noise.",
    "url": "https://open.substack.com/pub/thecurrencyofchange/p/the-gold-keeps-shining?r=1piuwx&utm_campaign=post-expanded-share&utm_medium=web",
    "external": true
  }
];

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
    + '</div></div>'
    + '<a class="blog-arrow" href="' + article.url + '"'
    + (article.external ? ' target="_blank" rel="noopener"' : '')
    + ' aria-label="Read">' + arrow + '</a>'
    + '</article>';
}

var activeFilter = 'all';

function renderArticles() {
  var list  = document.getElementById('blog-list');
  var empty = document.getElementById('blog-empty');
  var loading = document.getElementById('blog-loading');
  if (!list) return;
  if (loading) loading.style.display = 'none';

  var sorted = ARTICLES.slice().sort(function(a, b) {
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
  renderArticles();

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
