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
    const prevBtn = slider.querySelector('.image-slider__button--prev');
    const nextBtn = slider.querySelector('.image-slider__button--next');
    let currentIndex = 0;
    let sliderTimer = null;

    // Slides after the first keep their URLs in data-* so only the first image downloads on page open
    const loadSlide = (index) => {
      const slide = slides[(index + slides.length) % slides.length];
      slide.querySelectorAll('[data-srcset]').forEach((el) => {
        el.srcset = el.dataset.srcset;
        el.removeAttribute('data-srcset');
      });
      slide.querySelectorAll('[data-src]').forEach((el) => {
        el.src = el.dataset.src;
        el.removeAttribute('data-src');
      });
    };

    const setSlide = (index) => {
      currentIndex = (index + slides.length) % slides.length;
      loadSlide(currentIndex);
      if (document.readyState === 'complete') {
        loadSlide(currentIndex + 1);
        loadSlide(currentIndex - 1);
      }
      slides.forEach((slide, idx) => {
        slide.classList.toggle('image-slider__slide--active', idx === currentIndex);
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

    setSlide(0);
    startSlider();
    window.addEventListener('load', () => {
      loadSlide(currentIndex + 1);
      loadSlide(currentIndex - 1);
    });
  }

  /* ——— Achievements slider ——— */
  const achievements = document.querySelector('.achievements');
  if (achievements) {
    const track = achievements.querySelector('.achievements__track');
    const cards = Array.from(achievements.querySelectorAll('.achievement-card'));
    const prevBtn = achievements.querySelector('.achievements__arrow--prev');
    const nextBtn = achievements.querySelector('.achievements__arrow--next');
    const dotsWrap = achievements.parentElement.querySelector('.achievements__dots');
    let achieveIndex = 0;

    const dots = cards.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'achievements__dot';
      dot.setAttribute('aria-label', `Achievement ${index + 1}`);
      dot.addEventListener('click', () => setAchievement(index));
      dotsWrap?.appendChild(dot);
      return dot;
    });

    const setAchievement = (index) => {
      achieveIndex = (index + cards.length) % cards.length;
      track.style.transform = `translateX(-${achieveIndex * 100}%)`;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('achievements__dot--active', idx === achieveIndex);
      });
    };

    prevBtn?.addEventListener('click', () => setAchievement(achieveIndex - 1));
    nextBtn?.addEventListener('click', () => setAchievement(achieveIndex + 1));

    setAchievement(0);
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

  /* ——— Procedure video: YouTube, muted, plays only while in view ——— */
  const initProcedureVideos = () => {
    const mounts = Array.from(
      document.querySelectorAll('.procedure-video__player[data-youtube-id]')
    );
    if (!mounts.length) return;

    // Accept a full YouTube link (watch, youtu.be, embed, shorts) or a plain 11-char ID
    const extractYouTubeId = (value) => {
      if (!value) return '';
      value = value.trim();
      if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
      try {
        const url = new URL(value);
        const host = url.hostname.replace(/^www\./, '');
        if (host === 'youtu.be') return url.pathname.slice(1);
        if (url.searchParams.get('v')) return url.searchParams.get('v');
        const parts = url.pathname.split('/').filter(Boolean);
        const key = ['embed', 'shorts', 'v'].find((k) => parts.includes(k));
        if (key) return parts[parts.indexOf(key) + 1] || '';
      } catch (err) {
        /* not a valid URL — treat as no video (e.g. placeholder text) */
      }
      return '';
    };

    const targets = mounts
      .map((el) => ({ el, id: extractYouTubeId(el.getAttribute('data-youtube-id')) }))
      .filter((t) => t.id);
    if (!targets.length) return;

    // Play when at least half the player is on screen, pause otherwise
    const observePlayer = (player) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (typeof player.playVideo !== 'function') return;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              player.mute();
              player.playVideo();
            } else {
              player.pauseVideo();
            }
          });
        },
        { threshold: [0, 0.5] }
      );
      observer.observe(player.getIframe());
    };

    const buildPlayers = () => {
      targets.forEach(({ el, id }) => {
        new YT.Player(el, {
          videoId: id,
          playerVars: {
            mute: 1,
            controls: 0,
            disablekb: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            loop: 1,
            playlist: id
          },
          events: {
            onReady: (e) => {
              e.target.mute();
              observePlayer(e.target);
            }
          }
        });
      });
    };

    if (window.YT && window.YT.Player) {
      buildPlayers();
    } else {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === 'function') previousReady();
        buildPlayers();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }
  };

  initProcedureVideos();
})();
