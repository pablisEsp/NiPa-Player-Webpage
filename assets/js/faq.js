// Accordion toggles (markup is server-rendered; JS only adds behavior)
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', function() {
    const open = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !open);
    this.parentElement.classList.toggle('open', !open);
  });
});

// Search
const searchInput = document.getElementById('faqSearch');
const noResults = document.getElementById('faqNoResults');
searchInput.addEventListener('input', function() {
  const q = this.value.toLowerCase().trim();
  let found = 0;
  document.querySelectorAll('.faq-section').forEach(sec => {
    let sectionFound = 0;
    sec.querySelectorAll('.faq-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      const match = !q || text.includes(q);
      item.style.display = match ? '' : 'none';
      if (match) { sectionFound++; found++; }
    });
    sec.style.display = sectionFound ? '' : 'none';
  });
  noResults.style.display = found ? 'none' : '';
});

