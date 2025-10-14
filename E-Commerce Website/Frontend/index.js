// Initialize Glide.js Hero Slider
new Glide('#glide_1', {
  type: 'carousel',
  startAt: 0,
  perView: 1,
  focusAt: 'center',
  autoplay: 2000,
  gap: 0,
  hoverpause: true,
}).mount();

// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger-icon');
hamburger.addEventListener('click', function () {
  document.querySelector('.nav-list').classList.toggle('active');
});

// Active Navigation Link on Scroll
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 80; // Adjust if header is fixed
    const sectionHeight = section.clientHeight;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});
