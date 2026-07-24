/**
 * Maliviya Dental Clinic — Site interactions
 * WhatsApp booking, mobile/desktop call handling
 */

(function () {
  'use strict';

  const CONFIG = {
    clinicName: 'Maliviya Dental Clinic',
    doctorName: 'Dr Deepesh Agrawal',
    phone: '9314090002',
    phoneDisplay: '+91 93140 90002',
    whatsappCountryCode: '91'
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || (window.matchMedia && window.matchMedia('(max-width: 767px)').matches);
  };

  const getWhatsAppNumber = () => CONFIG.whatsappCountryCode + CONFIG.phone;

  const buildWhatsAppUrl = (message) => {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${getWhatsAppNumber()}?text=${encoded}`;
  };

  const buildAppointmentMessage = (data) => {
    const lines = [
      `*Appointment Request — ${CONFIG.clinicName}*`,
      '',
      `*Name:* ${data.fullName}`,
      `*Mobile:* ${data.mobile}`,
      `*City:* ${data.city}`
    ];

    if (data.treatment) lines.push(`*Treatment:* ${data.treatment}`);
    if (data.preferredDate) lines.push(`*Preferred Date:* ${data.preferredDate}`);
    if (data.timeSlot) lines.push(`*Preferred Time:* ${data.timeSlot}`);
    if (data.message) lines.push(`*Notes:* ${data.message}`);

    lines.push('', 'Please confirm my appointment. Thank you!');
    return lines.join('\n');
  };

  /* ——— Navigation ——— */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      // Prevent scrolling when nav is open
      document.body.style.overflow = open ? 'hidden' : '';
    });

    const closeNav = () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      // Re-enable scrolling when nav closes
      document.body.style.overflow = '';
    };

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    mainNav.querySelectorAll('[data-book-btn]').forEach((btn) => {
      btn.addEventListener('click', closeNav);
    });
  }

  /* ——— Header scroll shadow ——— */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener(
      'scroll',
      () => {
        header.style.boxShadow =
          window.scrollY > 10 ? '0 4px 20px rgba(0, 59, 92, 0.12)' : '';
      },
      { passive: true }
    );
  }

  /* ——— Hero image slider ——— */
  const slider = document.querySelector('.image-slider');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.image-slider__slide'));
    const dots = Array.from(slider.querySelectorAll('.image-slider__dot'));
    const prevBtn = slider.querySelector('.image-slider__button--prev');
    const nextBtn = slider.querySelector('.image-slider__button--next');
    let currentIndex = 0;
    let sliderTimer = null;

    const setSlide = (index) => {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle('image-slider__slide--active', idx === currentIndex);
      });
      dots.forEach((dot, idx) => {
        dot.classList.toggle('image-slider__dot--active', idx === currentIndex);
      });
    };

    const changeSlide = (offset) => {
      setSlide(currentIndex + offset);
    };

    const startSlider = () => {
      sliderTimer = window.setInterval(() => changeSlide(1), 6000);
    };

    const resetSlider = () => {
      if (sliderTimer) {
        window.clearInterval(sliderTimer);
      }
      startSlider();
    };

    prevBtn?.addEventListener('click', () => {
      changeSlide(-1);
      resetSlider();
    });

    nextBtn?.addEventListener('click', () => {
      changeSlide(1);
      resetSlider();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        setSlide(index);
        resetSlider();
      });
    });

    setSlide(0);
    startSlider();
  }

  /* ——— Phone display elements ——— */
  document.querySelectorAll('[data-phone-display]').forEach((el) => {
    el.textContent = CONFIG.phoneDisplay;
  });

  /* ——— Call Us: mobile = dialer, desktop = show number modal ——— */
  let phoneModal = null;

  const createPhoneModal = () => {
    if (phoneModal) return phoneModal;

    phoneModal = document.createElement('div');
    phoneModal.className = 'phone-modal';
    phoneModal.setAttribute('role', 'dialog');
    phoneModal.setAttribute('aria-labelledby', 'phoneModalTitle');
    phoneModal.innerHTML = `
      <div class="phone-modal__box">
        <h3 id="phoneModalTitle">Call ${CONFIG.clinicName}</h3>
        <p class="phone-modal__number">${CONFIG.phoneDisplay}</p>
        <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 20px;">
          ${CONFIG.doctorName}
        </p>
        <button type="button" class="phone-modal__close">Close</button>
      </div>
    `;

    document.body.appendChild(phoneModal);

    phoneModal.addEventListener('click', (e) => {
      if (e.target === phoneModal) hidePhoneModal();
    });

    phoneModal.querySelector('.phone-modal__close').addEventListener('click', hidePhoneModal);

    return phoneModal;
  };

  const showPhoneModal = () => {
    const modal = createPhoneModal();
    modal.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  };

  const hidePhoneModal = () => {
    if (!phoneModal) return;
    phoneModal.classList.remove('is-visible');
    document.body.style.overflow = '';
  };

  const handleCallClick = (e) => {
    if (isMobile()) {
      window.location.href = `tel:+${CONFIG.whatsappCountryCode}${CONFIG.phone}`;
      return;
    }

    e.preventDefault();
    showPhoneModal();
  };

  /* ——— Appointment modal ——— */
  const appointmentModal = document.getElementById('appointmentModal');

  const showAppointmentModal = () => {
    if (!appointmentModal) return;
    hidePhoneModal();
    appointmentModal.classList.add('is-visible');
    appointmentModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstField = document.getElementById('fullName');
    if (firstField) {
      window.setTimeout(() => firstField.focus(), 300);
    }
    // Push history state when opening form
    window.history.pushState({ modalType: 'form' }, '');
  };

  const hideAppointmentModal = () => {
    if (!appointmentModal) return;
    appointmentModal.classList.remove('is-visible');
    appointmentModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const isAppointmentModalOpen = () => {
    return appointmentModal?.classList.contains('is-visible');
  };

  document.querySelectorAll('[data-book-btn]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showAppointmentModal();
    });
  });

  appointmentModal?.querySelectorAll('[data-close-appointment]').forEach((el) => {
    el.addEventListener('click', hideAppointmentModal);
  });

  document.querySelectorAll('[data-call-btn]').forEach((btn) => {
    if (btn.tagName === 'A' && btn.getAttribute('href')?.startsWith('tel:')) {
      btn.addEventListener('click', (e) => {
        if (!isMobile()) {
          e.preventDefault();
          showPhoneModal();
        }
      });
    } else {
      btn.addEventListener('click', handleCallClick);
    }
  });

  /* ——— Appointment form → WhatsApp ——— */
  const appointmentForm = document.getElementById('appointmentForm');

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName');
      const mobile = document.getElementById('mobile');
      const city = document.getElementById('city');

      let valid = true;

      [fullName, mobile, city].forEach((field) => {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      const mobileVal = mobile.value.replace(/\D/g, '');
      if (mobileVal.length < 10) {
        mobile.classList.add('error');
        valid = false;
      }

      if (!valid) {
        const firstError = appointmentForm.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      const data = {
        fullName: fullName.value.trim(),
        mobile: mobile.value.trim(),
        city: city.value.trim(),
        treatment: document.getElementById('treatment').value,
        preferredDate: document.getElementById('preferredDate').value,
        timeSlot: document.getElementById('timeSlot').value,
        message: document.getElementById('message').value.trim()
      };

      const message = buildAppointmentMessage(data);
      const whatsappUrl = buildWhatsAppUrl(message);

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      appointmentForm.reset();
      hideAppointmentModal();
    });
  }

  /* ——— Back button handler for closing modals ——— */
  window.addEventListener('popstate', (e) => {
    const isChatOpen = () => {
      const popup = document.getElementById('chat-popup');
      return popup && popup.style.display === 'flex';
    };

    if (isAppointmentModalOpen()) {
      hideAppointmentModal();
      window.history.pushState(null, '');
    } else if (isChatOpen()) {
      document.getElementById('chat-popup').style.display = 'none';
      const waWrapper = document.getElementById('whatsapp-btn-wrapper');
      if (waWrapper) waWrapper.style.display = 'flex';
      window.history.pushState(null, '');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (appointmentModal?.classList.contains('is-visible')) {
      hideAppointmentModal();
    } else if (phoneModal?.classList.contains('is-visible')) {
      hidePhoneModal();
    }
  });

  /* ——— Min date for appointment = today ——— */
  const preferredDate = document.getElementById('preferredDate');
  if (preferredDate) {
    const today = new Date().toISOString().split('T')[0];
    preferredDate.setAttribute('min', today);
  }

  /* ——— Promotional pop-up (random image shown on every page load) ——— */
  const PROMO_POPUP = {
    folder: 'assets/images/pop-ups/',
    // List every image available in the pop-ups folder.
    // To add a new pop-up, drop the file in the folder and add its name here.
    images: ['pop-up-1.jpg', 'pop-up-2.jpg']
  };

  const initPromoPopup = () => {
    if (!PROMO_POPUP.images.length) return;

    const randomImage =
      PROMO_POPUP.images[Math.floor(Math.random() * PROMO_POPUP.images.length)];

    const popup = document.createElement('div');
    popup.className = 'promo-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-label', 'Special announcement');
    popup.innerHTML = `
      <div class="promo-popup__box">
        <button type="button" class="promo-popup__close" aria-label="Close pop-up">&times;</button>
        <img class="promo-popup__img" src="${PROMO_POPUP.folder}${randomImage}" alt="Special offer from ${CONFIG.clinicName}">
      </div>
    `;

    document.body.appendChild(popup);

    const closePopup = () => {
      popup.classList.remove('is-visible');
      document.body.style.overflow = '';
      window.setTimeout(() => popup.remove(), 300);
      document.removeEventListener('keydown', onKeydown);
    };

    const onKeydown = (e) => {
      if (e.key === 'Escape') closePopup();
    };

    popup.addEventListener('click', (e) => {
      // Close when clicking the backdrop (outside the image box)
      if (e.target === popup) closePopup();
    });

    popup.querySelector('.promo-popup__close').addEventListener('click', closePopup);
    document.addEventListener('keydown', onKeydown);

    // Reveal after it's in the DOM so the transition plays
    window.requestAnimationFrame(() => {
      popup.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    });
  };

  initPromoPopup();

  /* ——— WhatsApp chat widget (sits above the AI chat widget) ——— */
  const initWhatsappWidget = () => {
    const wrapper = document.createElement('div');
    wrapper.id = 'whatsapp-btn-wrapper';

    const chatUrl = buildWhatsAppUrl(
      `Hi ${CONFIG.clinicName}, I'd like to know more about your dental services.`
    );

    wrapper.innerHTML = `
      <div id="whatsapp-tooltip" aria-hidden="true">Chat with us on WhatsApp</div>
      <a id="whatsapp-btn" href="${chatUrl}" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
        <i class="ti ti-brand-whatsapp" aria-hidden="true"></i>
      </a>
    `;

    document.body.appendChild(wrapper);

    const tooltip = wrapper.querySelector('#whatsapp-tooltip');

    // Show the tooltip for the same duration as the AI chat tooltip (~10s)
    window.requestAnimationFrame(() => tooltip.classList.add('visible'));
    window.setTimeout(() => tooltip.classList.add('fadeout'), 10000);

    // Hide the tooltip once the user heads to WhatsApp
    wrapper.querySelector('#whatsapp-btn').addEventListener('click', () => {
      tooltip.classList.add('fadeout');
    });
  };

  initWhatsappWidget();
})();
