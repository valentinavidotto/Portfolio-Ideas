document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = 'Sending…';
    status.className = 'form-status';

    var data = {
      fname: form.fname.value.trim(),
      lname: form.lname.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };

    /*
      To receive emails: sign up at https://formspree.io, create a form,
      and replace YOUR_FORM_ID below with your actual form ID.
      It's free for up to 50 submissions/month.
    */
    var FORMSPREE_ID = 'mbdvdbry';

    try {
      var res = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        status.textContent = 'Message sent — thank you!';
        status.className = 'form-status success';
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      status.textContent = 'Something went wrong. Please email me directly.';
      status.className = 'form-status error';
    } finally {
      btn.disabled = false;
    }
  });
});

