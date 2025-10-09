const navLinks = document.querySelectorAll('nav a');

document.documentElement.style.scrollBehavior = "smooth";

navLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();   

    navLinks.forEach(l => l.classList.remove('active'));

    link.classList.add('active');

    const targetId = link.getAttribute('data-section');
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  });
});

const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    alert("Thank you for contacting us! We'll get back to you soon.");
    form.reset();
  });
}