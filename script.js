// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE MENU TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ===== HERO STATS COUNTER ANIMATION =====
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  counters.forEach(counter => {
    const target = +counter.dataset.target;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// Use IntersectionObserver to trigger counter animation
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statsObserver.observe(heroStats);
}

// ===== BMI CALCULATOR =====
const unitToggleBtns = document.querySelectorAll('.toggle-btn');
const metricInputs = document.getElementById('metricInputs');
const imperialInputs = document.getElementById('imperialInputs');
const calculateBtn = document.getElementById('calculateBtn');
const bmiResult = document.getElementById('bmiResult');
const bmiValue = document.getElementById('bmiValue');
const bmiCategory = document.getElementById('bmiCategory');
const gaugeNeedle = document.getElementById('gaugeNeedle');

let currentUnit = 'metric';

// Unit toggle
unitToggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    unitToggleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentUnit = btn.dataset.unit;

    if (currentUnit === 'metric') {
      metricInputs.style.display = 'block';
      imperialInputs.style.display = 'none';
    } else {
      metricInputs.style.display = 'none';
      imperialInputs.style.display = 'block';
    }
  });
});

// BMI calculation
calculateBtn.addEventListener('click', () => {
  let bmi;

  if (currentUnit === 'metric') {
    const heightCm = parseFloat(document.getElementById('heightCm').value);
    const weightKg = parseFloat(document.getElementById('weightKg').value);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      shakeButton();
      return;
    }

    const heightM = heightCm / 100;
    bmi = weightKg / (heightM * heightM);
  } else {
    const heightFt = parseFloat(document.getElementById('heightFt').value) || 0;
    const heightIn = parseFloat(document.getElementById('heightIn').value) || 0;
    const weightLbs = parseFloat(document.getElementById('weightLbs').value);

    const totalInches = (heightFt * 12) + heightIn;
    if (!totalInches || !weightLbs || totalInches <= 0 || weightLbs <= 0) {
      shakeButton();
      return;
    }

    bmi = (weightLbs / (totalInches * totalInches)) * 703;
  }

  bmi = Math.round(bmi * 10) / 10;
  displayResult(bmi);
});

function displayResult(bmi) {
  bmiResult.style.display = 'block';
  bmiValue.textContent = bmi;

  // Determine category
  let category, categoryClass;
  if (bmi < 18.5) {
    category = 'Underweight';
    categoryClass = 'underweight';
  } else if (bmi < 25) {
    category = 'Normal Weight';
    categoryClass = 'normal';
  } else if (bmi < 30) {
    category = 'Overweight';
    categoryClass = 'overweight';
  } else {
    category = 'Obese';
    categoryClass = 'obese';
  }

  bmiCategory.textContent = category;
  bmiCategory.className = 'bmi-category ' + categoryClass;

  // Animate gauge needle (maps BMI 10-40 to -90deg to 90deg)
  const clampedBmi = Math.min(Math.max(bmi, 10), 40);
  const angle = ((clampedBmi - 10) / 30) * 180 - 90;
  gaugeNeedle.style.transition = 'transform 1s ease-out';
  gaugeNeedle.setAttribute('transform', `rotate(${angle}, 100, 100)`);
}

function shakeButton() {
  calculateBtn.style.animation = 'shake 0.4s ease';
  calculateBtn.addEventListener('animationend', () => {
    calculateBtn.style.animation = '';
  }, { once: true });
}

// Add shake keyframes dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

// ===== SCROLL REVEAL ANIMATION =====
function setupReveal() {
  const revealElements = document.querySelectorAll(
    '.plan-card, .trainer-card, .section-header, .bmi-form-card, .bmi-result-card'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });
}

setupReveal();

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinkElems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinkElems.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = '#e63946';
    }
  });
});
