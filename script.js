// Track mobile menu state
let mobileMenuOpen = false;

// Intersection Observer setup (moved up before use)
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);



function showSection(id) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Show the selected section
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    const isMobile = window.innerWidth <= 768;

    const useFloating = ['contact', 'services', 'about', 'booking'].includes(id);

    if (useFloating) {
      footer.classList.remove('default-footer');
      footer.classList.add('floating-footer');
    } else {
      footer.classList.remove('floating-footer');
      footer.classList.add('default-footer');
    }
  }

  // Navbar background logic
  const navBar = document.querySelector('.nav-bar');
  if (navBar) {
    if (id === 'home') {
      navBar.classList.remove('solid');
    } else {
      navBar.classList.add('solid');
    }
  }
}



//Toggle menu for mobile devices
function toggleMenu() {
    const nav = document.querySelector('nav');
    nav.classList.toggle('active');
}
 //Sticky Navbar on Scroll ===
  const navbar = document.querySelector('nav');
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('sticky', window.scrollY > 0);
  });

// SERVICES SLIDER LOGIC
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

// Auto-slide every 3 seconds
setInterval(nextSlide, 3000);

window.addEventListener("scroll", function() {
var header = document.querySelector("header");
header.classList.toggle("sticky", window.scrollY > 0);
});

// Smooth Scrolling
function scrollToSection(selector) {
  const element = document.querySelector(selector);
  if (element) {
    const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 64;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  }
}

// PREREQ: wrap DOM logic in load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleFormSubmission);
    validateForm();
  }

  // Set min date
  const pickupDateInput = document.getElementById('pickupDate');
  if (pickupDateInput) {
    const today = new Date().toISOString().split('T')[0];
    pickupDateInput.setAttribute('min', today);
  }

  // Pre-fill booking form from URL param
  const urlParams = new URLSearchParams(window.location.search);
  const service = urlParams.get('service');
  const input = document.getElementById('ride-purpose');
  if (service && input) {
    input.value = service;
    showSection('booking');
  }

  // Footer logic on load
  const currentActive = document.querySelector('.page-section.active');
  const footer = document.getElementById('site-footer');
  if (footer && currentActive) {
    if (['booking', 'contact', 'services', 'about'].includes(currentActive.id)) {
      footer.classList.remove('default-footer');
      footer.classList.add('floating-footer');
    } else {
      footer.classList.remove('floating-footer');
      footer.classList.add('default-footer');
    }
  }

  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
      console.warn('Failed to load image:', this.src);
    });
  });

  const animatedElements = document.querySelectorAll('.service-card, .leader-card, .stat-item');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// Hide preloader and loaders
window.addEventListener('load', () => {
  const loader = document.getElementById('preloader');
  if (loader) loader.style.display = 'none';

  document.querySelectorAll('.loading').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.content').forEach(el => el.style.display = 'block');
});

// Click outside to close mobile menu
document.addEventListener('click', e => {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');

  if (mobileMenuOpen && mobileMenu && menuToggle) {
    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMobileMenu();
    }
  }
});

// Resize logic
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768 && mobileMenuOpen) {
    closeMobileMenu();
  }
});

// Mobile menu handlers
function openMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.add('open');
    mobileMenuOpen = true;
  }
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
    mobileMenuOpen = false;
  }
}

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

async function handleFormSubmission(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const requiredFields = ['firstName', 'lastName', 'email', 'service', 'subject', 'pickupDate', 'pickupTime', 'message'];
  const missing = requiredFields.filter(f => !data[f]?.trim());
  if (missing.length) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  const selDate = new Date(data.pickupDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selDate < today) {
    showToast('Pickup date cannot be in the past.', 'error');
    return;
  }

  const submitButton = e.target.querySelector('.form-submit');
  const origHTML = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = '<i data-lucide="loader-2"></i> Sending...';
  if (typeof lucide !== 'undefined') lucide.createIcons();

  try {
    await simulateFormSubmission(data);
    showToast('Booking request sent successfully! We\'ll get back to you within 24 hours.', 'success');
    e.target.reset();
  } catch (err) {
    console.error('Form submission error:', err);
    showToast('Failed to send booking request. Please try again or contact us directly.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = origHTML;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function simulateFormSubmission(data) {
  const templateParams = {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    service: data.service,
    subject: data.subject,
    pickup_date: data.pickupDate,
    pickup_time: data.pickupTime,
    message: data.message
  };

  const serviceID = "service_xjagy2o"; // ✅ Your EmailJS service ID
  const publicKey = "dR-XVOymamu0XJZhJ"; // ✅ Your public key

  try {
    // Email to your business
    const businessResponse = await emailjs.send(
      serviceID,
      "template_69x43h6", // 👈 Your business notification template
      templateParams,
      publicKey
    );
    console.log("Business email sent:", businessResponse.status, businessResponse.text);

    // Auto-reply to user
    const userResponse = await emailjs.send(
      serviceID,
      "template_1dtnd57", // 👈 Your auto-reply template
      templateParams,
      publicKey
    );
    console.log("Auto-reply sent to user:", userResponse.status, userResponse.text);

    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}


// Form field validation
function validateForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => clearFieldError(field));
  });
}

function validateField(field) {
  const value = field.value.trim();
  const name = field.getAttribute('name');
  field.classList.remove('error');

  if (field.hasAttribute('required') && !value) {
    showFieldError(field, `${getFieldLabel(name)} is required`);
    return false;
  }

  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, 'Please enter a valid email address');
      return false;
    }
  }

  if (field.type === 'date' && value) {
    const sel = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (sel < today) {
      showFieldError(field, 'Date cannot be in the past');
      return false;
    }
  }

  return true;
}

function showFieldError(field, message) {
  field.classList.add('error');
  const existing = field.parentNode.querySelector('.field-error');
  if (existing) existing.remove();

  const err = document.createElement('span');
  err.className = 'field-error';
  err.textContent = message;
  err.style.color = '#dc2626';
  err.style.fontSize = '0.875rem';
  err.style.marginTop = '0.25rem';
  field.parentNode.appendChild(err);
}

function clearFieldError(field) {
  field.classList.remove('error');
  const existing = field.parentNode.querySelector('.field-error');
  if (existing) existing.remove();
}

function getFieldLabel(fieldName) {
  const labels = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    service: 'Service Type',
    subject: 'Subject',
    pickupDate: 'Pickup Date',
    pickupTime: 'Pickup Time',
    message: 'Message'
  };
  return labels[fieldName] || fieldName;
}






/*function showSection(id) {
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.remove('active');
    });

    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const footer = document.getElementById('site-footer');
    if (footer) {
        if (['contact', 'services', 'about', 'booking'].includes(id)) {
            footer.classList.remove('default-footer');
            footer.classList.add('floating-footer');
        } else {
            footer.classList.remove('floating-footer');
            footer.classList.add('default-footer');
        }
    }
}

// SERVICES SLIDER LOGIC
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Auto-slide every 3 seconds
setInterval(nextSlide, 3000);

// === 3. Sticky Navbar on Scroll ===
  const navbar = document.querySelector('nav');
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('sticky', window.scrollY > 0);
});


  // === 8. Improved Navbar Show/Hide on Mousemove ===
  const improvedNavbar = document.querySelector('.navbar');
  let isNavbarHovered = false;

  improvedNavbar.addEventListener('mouseenter', () => {
    isNavbarHovered = true;
    improvedNavbar.classList.add('show');
  });

  improvedNavbar.addEventListener('mouseleave', () => {
    isNavbarHovered = false;
  });

  document.addEventListener('mousemove', function (e) {
    if (e.clientY < 50 || isNavbarHovered) {
      improvedNavbar.classList.add('show');
    } else {
      improvedNavbar.classList.remove('show');
    }
});


// Smooth Scrolling
function scrollToSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 64;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Form Handling & Lucide Init
document.addEventListener('DOMContentLoaded', function () {
    lucide.createIcons();

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmission);
        validateForm(); // Setup blur/input validation
    }

    // Set min date
    const pickupDateInput = document.getElementById('pickupDate');
    if (pickupDateInput) {
        const today = new Date().toISOString().split('T')[0];
        pickupDateInput.setAttribute('min', today);
    }

    // Pre-fill booking form from URL param
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    const input = document.getElementById('ride-purpose');
    if (service && input) {
        input.value = service;
        showSection('booking');
    }

    // Footer logic on load
    const currentActive = document.querySelector('.page-section.active');
    const footer = document.getElementById('site-footer');
    if (footer && currentActive) {
        if (['booking', 'contact', 'services', 'about'].includes(currentActive.id)) {
            footer.classList.remove('default-footer');
            footer.classList.add('floating-footer');
        } else {
            footer.classList.remove('floating-footer');
            footer.classList.add('default-footer');
        }
    }

    // Image error fallback
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            console.warn('Failed to load image:', this.src);
        });
    });

    // Scroll-triggered animations
    const animatedElements = document.querySelectorAll('.service-card, .leader-card, .stat-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Hide preloader and loaders
window.addEventListener('load', () => {
    const loader = document.getElementById('preloader');
    if (loader) loader.style.display = 'none';

    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.style.display = 'none');

    const contentElements = document.querySelectorAll('.content');
    contentElements.forEach(el => el.style.display = 'block');
});

// Click outside to close mobile menu
document.addEventListener('click', function (e) {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuToggle = document.querySelector('.menu-toggle');

    if (mobileMenuOpen && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMobileMenu();
    }
});

// Resize logic
window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && mobileMenuOpen) {
        closeMobileMenu();
    }
});

// Navbar scroll effect
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.nav-container');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
});

// Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Form Submission Handler
async function handleFormSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const requiredFields = ['firstName', 'lastName', 'email', 'service', 'subject', 'pickupDate', 'pickupTime', 'message'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');

    if (missingFields.length > 0) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    const selectedDate = new Date(data.pickupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        showToast('Pickup date cannot be in the past.', 'error');
        return;
    }

    const submitButton = e.target.querySelector('.form-submit');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i data-lucide="loader-2"></i> Sending...';
    lucide.createIcons();

    try {
        await simulateFormSubmission(data);
        showToast('Booking request sent successfully! We\'ll get back to you within 24 hours.', 'success');
        e.target.reset();
    } catch (error) {
        console.error('Form submission error:', error);
        showToast('Failed to send booking request. Please try again or contact us directly.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        lucide.createIcons();
    }
}

// Simulate submission
async function simulateFormSubmission(data) {
    const emailContent = `
New Booking Request from Eza Xpress Website

Customer Details:
- Name: ${data.firstName} ${data.lastName}
- Email: ${data.email}
- Service Type: ${data.service}
- Subject: ${data.subject}

Pickup Details:
- Date: ${data.pickupDate}
- Time: ${data.pickupTime}

Message:
${data.message}

Please contact the customer to confirm the booking and provide a quote.
    `;
    console.log('Booking request received:', data);
    console.log('Email content:', emailContent);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
}

// Booking form field validation
function validateForm() {
    const form = document.getElementById('booking-form');
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        input.addEventListener('input', function () {
            clearFieldError(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('name');
    field.classList.remove('error');

    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${getFieldLabel(fieldName)} is required`);
        return false;
    }

    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }

    if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showFieldError(field, 'Date cannot be in the past');
            return false;
        }
    }

    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');

    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) existingError.remove();

    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#dc2626';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';

    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) errorElement.remove();
}

function getFieldLabel(fieldName) {
    const labels = {
        'firstName': 'First Name',
        'lastName': 'Last Name',
        'email': 'Email',
        'service': 'Service Type',
        'subject': 'Subject',
        'pickupDate': 'Pickup Date',
        'pickupTime': 'Pickup Time',
        'message': 'Message'
    };
    return labels[fieldName] || fieldName;
}*/
