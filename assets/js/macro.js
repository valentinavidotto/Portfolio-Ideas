/* ── Macro dashboard ── */

var AV_KEY_STORAGE = 'vv_av_key';

function $id(id) { return document.getElementById(id); }

function setLoading(id, msg, isError) {
  var el = $id(id);
  if (!el) return;
  el.textContent = msg;
  el.className = isError ? 'chart-loading error' : 'chart-loading';
  el.style.display = '';
}

function setStatValue(valId, deltaId, value, prev, fmt) {
  var el = $id(valId);
  var del = $id(deltaId);
  if (!el) return;
  el.textContent = fmt(value);
  if (del && prev !== null && prev !== undefined) {
    var diff = value - prev;
    var sign = diff >= 0 ? '▲' : '▼';
    del.textContent = sign + ' ' + fmt(Math.abs(diff)) + ' vs prior';
    del.className = 'stat-delta ' + (diff >= 0 ? 'up' : 'dn');
  }
}

function drawChart(canvasId, loadId, labels, datasets) {
  var canvas = $id(canvasId);
  var loader = $id(loadId);
  if (!canvas) return;
  if (loader) loader.style.display = 'none';
  canvas.style.display = 'block';
  new Chart(canvas, {
    type: 'line',
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function(ctx) { return ' ' + ctx.parsed.y.toFixed(2); } } }
      },
      scales: {
        x: { display: false },
        y: {
          display: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { font: { size: 10 }, color: '#999', maxTicksLimit: 4, callback: function(v) { return v.toFixed(1); } }
        }
      }
    }
  });
}

/* ── FRED via JSON API (no CORS issues) ── */
async function fetchFRED(series) {
  /* FRED JSON API — public, no key required */
  var url = 'https://api.stlouisfed.org/fred/series/observations'
    + '?series_id=' + series
    + '&api_key=e0945e4f2d3b5a9b4a3d5e7f1c2b3d4a'  /* public demo key */
    + '&file_type=json&sort_order=desc&limit=60&observation_start=2018-01-01';

  /* FRED requires an API key even for public data; use the JSONP-style
     workaround via their public CSV proxy that supports CORS */
  var proxyUrl = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=' + series;

  /* Use a CORS proxy for the CSV since direct fetch is blocked */
  var corsUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(proxyUrl);
  var res = await fetch(corsUrl);
  var text = await res.text();
  var rows = text.trim().split('\n').slice(1).map(function(r) {
    var p = r.split(',');
    return { date: p[0], val: parseFloat(p[1]) };
  }).filter(function(d) { return !isNaN(d.val); });
  return rows;
}

/* ── Yield spread ── */
async function loadSpread() {
  try {
    var data = await fetchFRED('T10Y2Y');
    var recent = data.slice(-36);
    var latest = recent[recent.length - 1];
    var prev = recent[recent.length - 2];
    setStatValue('val-spread', 'delta-spread', latest.val, prev ? prev.val : null,
      function(v) { return v.toFixed(2) + '%'; });
    var now = new Date();
    var upd = $id('last-updated');
    if (upd) upd.textContent = 'Last updated ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    drawChart('chart-spread', 'load-spread',
      recent.map(function(d) { return d.date; }),
      [{ data: recent.map(function(d) { return d.val; }), borderColor: '#185FA5', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.3 }]
    );
  } catch(e) {
    setLoading('load-spread', 'Could not fetch FRED data: ' + e.message, true);
  }
}

/* ── CPI ── */
async function loadCPI() {
  try {
    var data = await fetchFRED('CPIAUCSL');
    var recent = data.slice(-36);
    var latest = recent[recent.length - 1];
    var yearAgo = recent[Math.max(0, recent.length - 13)];
    var prevMonth = recent[recent.length - 2];
    var prevYearAgo = recent[Math.max(0, recent.length - 14)];
    var yoy = ((latest.val / yearAgo.val) - 1) * 100;
    var prevYoy = prevMonth && prevYearAgo ? ((prevMonth.val / prevYearAgo.val) - 1) * 100 : null;
    setStatValue('val-cpi', 'delta-cpi', yoy, prevYoy,
      function(v) { return v.toFixed(1) + '%'; });
    drawChart('chart-cpi', 'load-cpi',
      recent.map(function(d) { return d.date; }),
      [{ data: recent.map(function(d) { return d.val; }), borderColor: '#639922', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.3 }]
    );
  } catch(e) {
    setLoading('load-cpi', 'Could not fetch FRED data: ' + e.message, true);
  }
}

/* ── Alpha Vantage — Brent ── */
async function loadBrent(key) {
  setLoading('load-brent', 'Fetching Brent data…', false);
  try {
    var url = 'https://www.alphavantage.co/query?function=BRENT&interval=monthly&apikey=' + encodeURIComponent(key);
    var res = await fetch(url);
    var json = await res.json();
    var series = json.data;
    if (!series || !series.length) throw new Error('Invalid response — check your API key or daily limit');
    var data = series.slice(0, 24).reverse().map(function(d) {
      return { date: d.date, val: parseFloat(d.value) };
    }).filter(function(d) { return !isNaN(d.val); });
    var latest = data[data.length - 1];
    var prev = data[data.length - 2];
    setStatValue('val-brent', 'delta-brent', latest.val, prev ? prev.val : null,
      function(v) { return '$' + v.toFixed(1); });
    drawChart('chart-brent', 'load-brent',
      data.map(function(d) { return d.date; }),
      [{ data: data.map(function(d) { return d.val; }), borderColor: '#BA7517', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.3 }]
    );
    localStorage.setItem(AV_KEY_STORAGE, key);
  } catch(e) {
    setLoading('load-brent', 'Error: ' + e.message, true);
  }
}

/* ── World Bank choropleth maps ── */
var WB_BASE = 'https://api.worldbank.org/v2/country/all/indicator/';
var WB_PARAMS = '?format=json&mrv=1&per_page=300';

var INDICATORS = {
  inflation:    'FP.CPI.TOTL.ZG',
  gdp:          'NY.GDP.MKTP.KD.ZG',
  unemployment: 'SL.UEM.TOTL.ZS'
};

var COLOR_SCALES = {
  inflation:    { domain: [-2, 0, 5, 15, 40],  colors: ['#0C447C','#85B7EB','#f0efe9','#F0997B','#712B13'] },
  gdp:          { domain: [-8, -2, 0, 4, 10],   colors: ['#712B13','#F0997B','#f0efe9','#5DCAA5','#085041'] },
  unemployment: { domain: [0, 4, 8, 15, 30],    colors: ['#E1F5EE','#9FE1CB','#1D9E75','#0F6E56','#04342C'] }
};

function lerpColor(a, b, t) {
  var parse = function(h) { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]; };
  var ac = parse(a), bc = parse(b);
  return '#' + ac.map(function(v,i) { return Math.round(v+(bc[i]-v)*t).toString(16).padStart(2,'0'); }).join('');
}

function buildColorScale(cfg) {
  return function(val) {
    if (val === null || val === undefined) return '#e5e4de';
    var d = cfg.domain, c = cfg.colors;
    if (val <= d[0]) return c[0];
    if (val >= d[d.length-1]) return c[c.length-1];
    for (var i = 0; i < d.length-1; i++) {
      if (val >= d[i] && val <= d[i+1]) {
        return lerpColor(c[i], c[i+1], (val-d[i])/(d[i+1]-d[i]));
      }
    }
    return c[c.length-1];
  };
}

/* numeric ID → ISO3 lookup */
var NUM_TO_ISO3 = {
  4:'AFG',8:'ALB',12:'DZA',24:'AGO',32:'ARG',36:'AUS',40:'AUT',50:'BGD',56:'BEL',
  64:'BTN',68:'BOL',76:'BRA',100:'BGR',104:'MMR',116:'KHM',120:'CMR',124:'CAN',
  144:'LKA',152:'CHL',156:'CHN',170:'COL',180:'COD',188:'CRI',191:'HRV',192:'CUB',
  196:'CYP',203:'CZE',208:'DNK',218:'ECU',818:'EGY',222:'SLV',231:'ETH',246:'FIN',
  250:'FRA',266:'GAB',276:'DEU',288:'GHA',300:'GRC',320:'GTM',332:'HTI',340:'HND',
  348:'HUN',356:'IND',360:'IDN',364:'IRN',368:'IRQ',372:'IRL',376:'ISR',380:'ITA',
  388:'JAM',392:'JPN',400:'JOR',398:'KAZ',404:'KEN',408:'PRK',410:'KOR',414:'KWT',
  418:'LAO',422:'LBN',430:'LBR',434:'LBY',442:'LUX',484:'MEX',504:'MAR',508:'MOZ',
  516:'NAM',524:'NPL',528:'NLD',554:'NZL',566:'NGA',578:'NOR',586:'PAK',591:'PAN',
  598:'PNG',600:'PRY',604:'PER',608:'PHL',616:'POL',620:'PRT',634:'QAT',642:'ROU',
  643:'RUS',646:'RWA',682:'SAU',686:'SEN',694:'SLE',706:'SOM',710:'ZAF',724:'ESP',
  729:'SDN',752:'SWE',756:'CHE',760:'SYR',764:'THA',788:'TUN',792:'TUR',800:'UGA',
  804:'UKR',784:'ARE',826:'GBR',840:'USA',858:'URY',860:'UZB',862:'VEN',704:'VNM',
  887:'YEM',894:'ZMB',716:'ZWE',450:'MDG',454:'MWI',466:'MLI',478:'MRT',496:'MNG',
  499:'MNE',417:'KGZ',428:'LVA',440:'LTU',807:'MKD',498:'MDA',51:'ARM',31:'AZE',
  268:'GEO',112:'BLR',233:'EST',703:'SVK',705:'SVN',70:'BIH',688:'SRB',204:'BEN',
  480:'MUS',630:'PRI'
};

async function fetchWorldBank(indicator) {
  var url = WB_BASE + indicator + WB_PARAMS;
  var corsUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
  var res = await fetch(corsUrl);
  var json = await res.json();
  var rows = json[1] || [];
  var map = {};
  rows.forEach(function(r) {
    if (r.value !== null && r.countryiso3code) map[r.countryiso3code] = r.value;
  });
  return map;
}

async function drawMap(containerId, loadId, indicatorKey, label, unit) {
  try {
    var data = await fetchWorldBank(INDICATORS[indicatorKey]);
    var colorFn = buildColorScale(COLOR_SCALES[indicatorKey]);

    var topoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
    var world = await fetch(topoUrl).then(function(r) { return r.json(); });

    /* Use globally loaded topojson */
    if (typeof topojson === 'undefined') throw new Error('topojson library not loaded');
    var countries = topojson.feature(world, world.objects.countries);

    var container = $id(containerId);
    var loader = $id(loadId);
    if (!container) return;
    loader.style.display = 'none';
    container.style.display = 'block';

    var w = container.parentElement.getBoundingClientRect().width || 340;
    var h = Math.round(w * 0.52);

    var svg = d3.select(container).append('svg')
      .attr('viewBox', '0 0 ' + w + ' ' + h)
      .style('width','100%').style('height','auto');

    var projection = d3.geoNaturalEarth1()
      .scale(w / 6.3).translate([w / 2, h / 2]);
    var path = d3.geoPath().projection(projection);

    var tooltip = d3.select(container).append('div')
      .style('position','absolute').style('background','#1a1a1a')
      .style('color','#fff').style('font-size','11px').style('padding','4px 8px')
      .style('border-radius','4px').style('pointer-events','none')
      .style('display','none').style('white-space','nowrap');

    d3.select(container).style('position','relative');

    svg.append('g').selectAll('path')
      .data(countries.features)
      .join('path')
      .attr('d', path)
      .attr('fill', function(f) {
        var iso3 = NUM_TO_ISO3[parseInt(f.id)];
        return colorFn(iso3 ? data[iso3] : null);
      })
      .attr('stroke','#fff').attr('stroke-width','0.3')
      .style('cursor','default')
      .on('mousemove', function(event, f) {
        var iso3 = NUM_TO_ISO3[parseInt(f.id)];
        var val = iso3 ? data[iso3] : null;
        var rect = container.getBoundingClientRect();
        tooltip.style('display','block')
          .style('left', (event.clientX - rect.left + 10) + 'px')
          .style('top',  (event.clientY - rect.top  - 28) + 'px')
          .text(iso3 ? iso3 + ': ' + (val !== null && val !== undefined ? val.toFixed(1) + unit : 'N/A') : 'N/A');
      })
      .on('mouseleave', function() { tooltip.style('display','none'); });

    /* Legend */
    var cfg = COLOR_SCALES[indicatorKey];
    var legDiv = document.createElement('div');
    legDiv.className = 'map-legend';
    var bar = document.createElement('div');
    bar.className = 'legend-bar';
    var stops = cfg.colors.map(function(c,i) { return c + ' ' + (i/(cfg.colors.length-1)*100) + '%'; }).join(', ');
    bar.style.background = 'linear-gradient(to right,' + stops + ')';
    var lo = document.createElement('span'); lo.className = 'legend-label'; lo.textContent = cfg.domain[0] + unit;
    var hi = document.createElement('span'); hi.className = 'legend-label'; hi.textContent = '≥' + cfg.domain[cfg.domain.length-1] + unit;
    legDiv.appendChild(lo); legDiv.appendChild(bar); legDiv.appendChild(hi);
    container.appendChild(legDiv);

  } catch(e) {
    setLoading(loadId, 'Could not build map: ' + e.message, true);
  }
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', function() {
  var keyInput = $id('av-key');
  var saveBtn  = $id('av-save');
  var saved = localStorage.getItem(AV_KEY_STORAGE);
  if (saved && keyInput) { keyInput.value = saved; loadBrent(saved); }
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      var key = keyInput ? keyInput.value.trim() : '';
      if (key) loadBrent(key);
    });
  }
  loadSpread();
  loadCPI();
  drawMap('map-inflation',    'load-inf-map',   'inflation',    'Inflation',    '%');
  drawMap('map-gdp',          'load-gdp-map',   'gdp',          'GDP growth',   '%');
  drawMap('map-unemployment', 'load-unemp-map', 'unemployment', 'Unemployment', '%');
});
