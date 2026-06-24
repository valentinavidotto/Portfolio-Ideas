document.addEventListener('DOMContentLoaded', function () {
  var btns = document.querySelectorAll('.filter-btn');
  var items = document.querySelectorAll('.blog-item');

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.dataset.filter;
      btns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      items.forEach(function (item) {
        if (filter === 'all' || item.dataset.tag === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
});
