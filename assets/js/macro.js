/* ── Macro dashboard ── */

/* Alpha Vantage key — replace with your actual key */
var AV_KEY = 'YOUR_AV_KEY_HERE';

function $id(id) { return document.getElementById(id); }

function waitForLib(name, cb, tries) {
  tries = tries || 0;
  if (window[name]) { cb(); return; }
  if (tries > 50) { cb(new Error(name + ' failed to load')); return; }
  setTimeout(function() { waitForLib(name, cb, tries + 1); }, 100);
}

/* ── Alpha Vantage — Brent ── */
async function loadBrent() {
  var el = $id('val-brent');
  try {
    var url = 'https://www.alphavantage.co/query?function=BRENT&interval=monthly&apikey=' + AV_KEY;
    var res = await fetch(url);
    var json = await res.json();
    if (json.Information) throw new Error('limit');
    var series = json.data;
    if (!series || !series.length) throw new Error('no data');
    var latest = series[0];
    if (el) el.textContent = '$' + parseFloat(latest.value).toFixed(1);
    var prev = series[1];
    var delta = $id('delta-brent');
    if (delta && prev) {
      var diff = parseFloat(latest.value) - parseFloat(prev.value);
      delta.textContent = (diff >= 0 ? '▲' : '▼') + ' $' + Math.abs(diff).toFixed(1) + ' vs prior month';
      delta.className = 'stat-delta ' + (diff >= 0 ? 'up' : 'dn');
    }
  } catch(e) {
    if (el) el.textContent = '—';
  }
}

/* ── World Bank choropleth maps ── */
var INDICATORS = {
  inflation:    'FP.CPI.TOTL.ZG',
  gdp:          'NY.GDP.MKTP.KD.ZG',
  unemployment: 'SL.UEM.TOTL.ZS'
};
var COLOR_SCALES = {
  inflation:    { domain: [-2, 0, 5, 15, 40],  colors: ['#0C447C','#85B7EB','#f0efe9','#F0997B','#712B13'] },
  gdp:          { domain: [-8, -2, 0, 4, 10],  colors: ['#712B13','#F0997B','#f0efe9','#5DCAA5','#085041'] },
  unemployment: { domain: [0, 4, 8, 15, 30],   colors: ['#E1F5EE','#9FE1CB','#1D9E75','#0F6E56','#04342C'] }
};

function lerpColor(a, b, t) {
  var p = function(h, s, l) { return parseInt(h.slice(s, l), 16); };
  var r = function(v) { return Math.round(v).toString(16).padStart(2, '0'); };
  return '#' + r(p(a,1,3)+(p(b,1,3)-p(a,1,3))*t)
             + r(p(a,3,5)+(p(b,3,5)-p(a,3,5))*t)
             + r(p(a,5,7)+(p(b,5,7)-p(a,5,7))*t);
}

function buildColorScale(cfg) {
  return function(val) {
    if (val === null || val === undefined) return '#e5e4de';
    var d = cfg.domain, c = cfg.colors;
    if (val <= d[0]) return c[0];
    if (val >= d[d.length-1]) return c[c.length-1];
    for (var i = 0; i < d.length-1; i++) {
      if (val >= d[i] && val <= d[i+1])
        return lerpColor(c[i], c[i+1], (val-d[i])/(d[i+1]-d[i]));
    }
    return c[c.length-1];
  };
}

var NUM_TO_ISO3 = {
  4:'AFG',8:'ALB',12:'DZA',24:'AGO',32:'ARG',36:'AUS',40:'AUT',50:'BGD',56:'BEL',
  64:'BTN',68:'BOL',76:'BRA',100:'BGR',104:'MMR',116:'KHM',120:'CMR',124:'CAN',
  144:'LKA',152:'CHL',156:'CHN',170:'COL',180:'COD',188:'CRI',191:'HRV',192:'CUB',
  196:'CYP',203:'CZE',208:'DNK',218:'ECU',818:'EGY',222:'SLV',231:'ETH',246:'FIN',
  250:'FRA',266:'GAB',276:'DEU',288:'GHA',300:'GRC',320:'GTM',332:'HTI',340:'HND',
  348:'HUN',356:'IND',360:'IDN',364:'IRN',368:'IRQ',372:'IRL',376:'ISR',380:'ITA',
  388:'JAM',392:'JPN',400:'JOR',398:'KAZ',404:'KEN',410:'KOR',414:'KWT',418:'LAO',
  422:'LBN',434:'LBY',442:'LUX',484:'MEX',504:'MAR',508:'MOZ',516:'NAM',524:'NPL',
  528:'NLD',554:'NZL',566:'NGA',578:'NOR',586:'PAK',591:'PAN',600:'PRY',604:'PER',
  608:'PHL',616:'POL',620:'PRT',634:'QAT',642:'ROU',643:'RUS',646:'RWA',682:'SAU',
  686:'SEN',710:'ZAF',724:'ESP',729:'SDN',752:'SWE',756:'CHE',764:'THA',788:'TUN',
  792:'TUR',800:'UGA',804:'UKR',784:'ARE',826:'GBR',840:'USA',858:'URY',862:'VEN',
  704:'VNM',887:'YEM',894:'ZMB',716:'ZWE',450:'MDG',454:'MWI',466:'MLI',496:'MNG',
  499:'MNE',417:'KGZ',428:'LVA',440:'LTU',807:'MKD',498:'MDA',51:'ARM',31:'AZE',
  268:'GEO',112:'BLR',233:'EST',703:'SVK',705:'SVN',70:'BIH',688:'SRB',204:'BEN',
  480:'MUS',760:'SYR',598:'PNG',694:'SLE',706:'SOM',860:'UZB',630:'PRI'
};

async function fetchWorldBank(indicator) {
  var url = 'https://api.worldbank.org/v2/country/all/indicator/'
    + indicator + '?format=json&mrv=1&per_page=300';
  var res = await fetch(url);
  if (!res.ok) throw new Error('World Bank ' + res.status);
  var json = await res.json();
  var rows = json[1] || [], map = {};
  rows.forEach(function(r) {
    if (r.value !== null && r.countryiso3code) map[r.countryiso3code] = r.value;
  });
  return map;
}

async function drawMap(containerId, loadId, indicatorKey, unit) {
  try {
    var data = await fetchWorldBank(INDICATORS[indicatorKey]);
    var colorFn = buildColorScale(COLOR_SCALES[indicatorKey]);
    var world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
      .then(function(r) { return r.json(); });
    await new Promise(function(resolve, reject) {
      waitForLib('topojson', function(err) { err ? reject(err) : resolve(); });
    });
    var countries = topojson.feature(world, world.objects.countries);
    var container = $id(containerId), loader = $id(loadId);
    if (!container) return;
    loader.style.display = 'none';
    container.style.display = 'block';
    var w = container.parentElement.getBoundingClientRect().width || 340;
    var h = Math.round(w * 0.52);
    var svg = d3.select(container).append('svg')
      .attr('viewBox', '0 0 ' + w + ' ' + h)
      .style('width', '100%').style('height', 'auto');
    var proj = d3.geoNaturalEarth1().scale(w / 6.3).translate([w / 2, h / 2]);
    var path = d3.geoPath().projection(proj);
    d3.select(container).style('position', 'relative');
    var tip = d3.select(container).append('div')
      .style('position','absolute').style('background','#1a1a1a').style('color','#fff')
      .style('font-size','11px').style('padding','4px 8px').style('border-radius','4px')
      .style('pointer-events','none').style('display','none').style('white-space','nowrap');
    svg.append('g').selectAll('path').data(countries.features).join('path')
      .attr('d', path)
      .attr('fill', function(f) {
        var iso3 = NUM_TO_ISO3[parseInt(f.id)];
        return colorFn(iso3 ? data[iso3] : null);
      })
      .attr('stroke', '#fff').attr('stroke-width', '0.3')
      .on('mousemove', function(event, f) {
        var iso3 = NUM_TO_ISO3[parseInt(f.id)], val = iso3 ? data[iso3] : null;
        var rect = container.getBoundingClientRect();
        tip.style('display','block')
           .style('left', (event.clientX - rect.left + 10) + 'px')
           .style('top',  (event.clientY - rect.top  - 28) + 'px')
           .text(iso3 ? iso3 + ': ' + (val != null ? val.toFixed(1) + unit : 'N/A') : 'N/A');
      })
      .on('mouseleave', function() { tip.style('display', 'none'); });
    var cfg = COLOR_SCALES[indicatorKey];
    var leg = document.createElement('div'); leg.className = 'map-legend';
    var bar = document.createElement('div'); bar.className = 'legend-bar';
    bar.style.background = 'linear-gradient(to right,' +
      cfg.colors.map(function(c, i) { return c + ' ' + (i/(cfg.colors.length-1)*100) + '%'; }).join(',') + ')';
    var lo = document.createElement('span'); lo.className = 'legend-label'; lo.textContent = cfg.domain[0] + unit;
    var hi = document.createElement('span'); hi.className = 'legend-label'; hi.textContent = '≥' + cfg.domain[cfg.domain.length-1] + unit;
    leg.appendChild(lo); leg.appendChild(bar); leg.appendChild(hi);
    container.appendChild(leg);
  } catch(e) {
    var loader = $id(loadId);
    if (loader) { loader.textContent = 'Map error: ' + e.message; loader.className = 'chart-loading error'; loader.style.display = ''; }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadBrent();
  drawMap('map-inflation',    'load-inf-map',   'inflation',    '%');
  drawMap('map-gdp',          'load-gdp-map',   'gdp',          '%');
  drawMap('map-unemployment', 'load-unemp-map', 'unemployment', '%');
});
