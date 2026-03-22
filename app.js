/* ============================================================
   Lupine Company — App.js
   Vanilla JS: scroll nav, mobile menu, counters, reveals, smooth scroll
   ============================================================ */

// ─── Scroll-Aware Navigation ───
(function() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    const currentScrollY = window.scrollY;

    // Hide on scroll down, show on scroll up
    if (currentScrollY > 120 && currentScrollY > lastScrollY + 5) {
      nav.classList.add('nav--hidden');
    } else if (currentScrollY < lastScrollY - 5) {
      nav.classList.remove('nav--hidden');
    }

    // Add scrolled state for enhanced background
    if (currentScrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})();


// ─── Mobile Menu Toggle ───
(function() {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const links = menu.querySelectorAll('a');

  function closeMenu() {
    menu.classList.remove('active');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMenu() {
    menu.classList.add('active');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', function() {
    const isOpen = menu.classList.contains('active');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  links.forEach(function(link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      closeMenu();
    }
  });
})();


// ─── Smooth Scroll for Anchor Links ───
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var href = this.getAttribute('href');
    if (href === '#') return;
    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ─── Scroll Reveal Animations with Stagger ───
(function() {
  var revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        // Check if this is a parent container with staggered children
        var el = entry.target;
        var delay = el.getAttribute('data-reveal-delay');

        if (delay) {
          var delayMs = parseInt(delay, 10) * 50; // 50ms stagger
          setTimeout(function() {
            el.classList.add('revealed');
          }, delayMs);
        } else {
          el.classList.add('revealed');
        }

        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  revealElements.forEach(function(el) {
    observer.observe(el);
  });
})();


// ─── Animated Number Counters ───
(function() {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  var hasRun = false;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800; // ms
    var startTime = null;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutExpo(progress);
      var current = Math.round(easedProgress * target);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !hasRun) {
        hasRun = true;

        counters.forEach(function(counter, index) {
          setTimeout(function() {
            animateCounter(counter);
          }, index * 150); // Stagger each counter
        });

        observer.disconnect();
      }
    });
  }, {
    threshold: 0.3
  });

  // Observe the stats bar container
  var statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    observer.observe(statsBar);
  }
})();


// ─── Marquee: ensure seamless loop ───
// The marquee animation is handled purely with CSS @keyframes.
// This JS is optional — it could dynamically clone content if needed.
// Currently the HTML has duplicated content for seamless CSS-only looping.


// ─── AI Optimization Scorecard (Multi-step Wizard) ───
(function() {
  var CALENDLY_BASE = 'https://calendly.com/alex-k-schumacher/30min';
  var API_ENDPOINT = '/api/scorecard-submit';
  var TOTAL_STEPS = 9;

  // Elements
  var intro = document.getElementById('scIntro');
  var wizard = document.getElementById('scWizard');
  var resultDiv = document.getElementById('scorecardResult');
  var startBtn = document.getElementById('scStartBtn');
  if (!intro || !wizard || !resultDiv || !startBtn) return;

  var steps = wizard.querySelectorAll('.scorecard__step');
  var progressBar = document.getElementById('scProgressBar');
  var stepCurrent = document.getElementById('scStepCurrent');
  var navContainer = document.getElementById('scNav');
  var backBtn = document.getElementById('scBack');
  var nextBtn = document.getElementById('scNext');

  var currentStep = 1;
  var answers = {};

  // Scoring maps
  var leadResponseScores = { 'Within 1 hour': 3, 'Same business day': 2, '1-2 days': 1, '3+ days / not consistent': 0, 'Not sure': 0 };
  var followUpScores = { 'Automated sequences (email/SMS)': 3, 'Manual reminders in CRM': 2, 'Personal to-do lists / spreadsheets': 1, "Ad hoc / in people's heads": 0 };
  var reportingScores = { 'Very easy - we have clean dashboards': 3, 'Manageable - some manual work': 2, 'Painful - lots of manual spreadsheets': 1, "We don't really have reliable reporting": 0 };
  var crmScores = { 'HubSpot': 2, 'Salesforce': 2, 'Other CRM': 2, 'Spreadsheets / Email only': 1, 'None': 0 };

  function computeScore() {
    return (leadResponseScores[answers.lead_response_time] || 0) +
           (followUpScores[answers.follow_up_process] || 0) +
           (reportingScores[answers.reporting_pain] || 0) +
           (crmScores[answers.crm_usage] || 0);
  }

  function getScoreBand(s) {
    if (s <= 4) return 'High-Impact Opportunity';
    if (s <= 8) return 'Strong foundation, messy execution';
    return 'Optimized but ready for leverage';
  }

  function getProfileLabel(s) {
    if (s <= 4) return 'Manual and reactive \u2013 big quick wins available';
    if (s <= 8) return 'Decent tools, but leaking follow-ups and reporting clarity';
    return "You're in good shape; next step is deeper AI and RevOps optimization";
  }

  function getTags() {
    var tags = [];
    var lr = answers.lead_response_time;
    if (lr === '1-2 days' || lr === '3+ days / not consistent' || lr === 'Not sure') tags.push('slow_follow_up');
    var rp = answers.reporting_pain;
    if (rp === 'Painful - lots of manual spreadsheets' || rp === "We don't really have reliable reporting") tags.push('reporting_gap');
    var crm = answers.crm_usage;
    if (crm === 'Spreadsheets / Email only' || crm === 'None') tags.push('no_crm');
    return tags;
  }

  function buildCalendlyUrl(scoreBand) {
    var band = encodeURIComponent(scoreBand.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    return CALENDLY_BASE + '?utm_source=scorecard&utm_medium=website&utm_campaign=optimization_scorecard&utm_content=' + band;
  }

  // Step has option buttons (auto-advance on click)?
  function stepHasOptions(stepEl) {
    return !!stepEl.querySelector('.scorecard__options');
  }

  // Show/hide nav buttons depending on step type
  function updateNav() {
    var stepEl = steps[currentStep - 1];
    var hasOptions = stepHasOptions(stepEl);
    var isLast = currentStep === TOTAL_STEPS;

    // Show back button from step 2 onward
    backBtn.hidden = currentStep <= 1;

    // Hide Continue on option-button steps (auto-advance), show on text/select/textarea steps
    if (hasOptions) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = '';
      nextBtn.textContent = isLast ? 'Get My Score' : 'Continue';
    }
  }

  function updateProgress() {
    var pct = (currentStep / TOTAL_STEPS) * 100;
    progressBar.style.width = pct + '%';
    stepCurrent.textContent = currentStep;
  }

  // Collect answers from the current step's inputs
  function collectStepAnswers(stepEl) {
    var inputs = stepEl.querySelectorAll('input, select, textarea');
    inputs.forEach(function(inp) {
      if (inp.name && inp.value) {
        answers[inp.name] = inp.value;
      }
    });
  }

  // Validate required fields in the current step
  function validateStep(stepEl) {
    var valid = true;
    var required = stepEl.querySelectorAll('[required]');
    required.forEach(function(field) {
      field.classList.remove('invalid');
      if (!field.value || field.value.trim() === '') {
        field.classList.add('invalid');
        valid = false;
      }
      if (field.type === 'email' && field.value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          field.classList.add('invalid');
          valid = false;
        }
      }
    });
    if (!valid) {
      var first = stepEl.querySelector('.invalid');
      if (first) first.focus();
    }
    return valid;
  }

  // Animate transition between steps
  function goToStep(newStep, direction) {
    if (newStep < 1 || newStep > TOTAL_STEPS) return;

    var oldStepEl = steps[currentStep - 1];
    var newStepEl = steps[newStep - 1];

    // Animate out
    oldStepEl.classList.remove('visible');
    oldStepEl.classList.add(direction === 'forward' ? 'exit-left' : '');

    setTimeout(function() {
      oldStepEl.classList.remove('active', 'exit-left');

      // Prepare new step
      newStepEl.style.transform = direction === 'forward' ? 'translateX(30px)' : 'translateX(-30px)';
      newStepEl.classList.add('active');

      // Force reflow then animate in
      void newStepEl.offsetHeight;
      newStepEl.style.transform = '';
      newStepEl.classList.add('visible');

      currentStep = newStep;
      updateProgress();
      updateNav();

      // Focus first input in new step
      var firstInput = newStepEl.querySelector('input, select, textarea');
      if (firstInput && !stepHasOptions(newStepEl)) {
        setTimeout(function() { firstInput.focus(); }, 100);
      }
    }, 200);
  }

  function submitScorecard() {
    var score = computeScore();
    var scoreBand = getScoreBand(score);
    var profileLabel = getProfileLabel(score);
    var tags = getTags();
    var calendlyUrl = buildCalendlyUrl(scoreBand);

    var payload = {
      full_name: answers.full_name || '',
      email: answers.email || '',
      company_name: answers.company_name || '',
      website_url: answers.website_url || '',
      role: answers.role || '',
      company_size: answers.company_size || '',
      crm_usage: answers.crm_usage || '',
      lead_response_time: answers.lead_response_time || '',
      follow_up_process: answers.follow_up_process || '',
      reporting_pain: answers.reporting_pain || '',
      biggest_bottleneck: answers.biggest_bottleneck || '',
      process_description: answers.process_description || '',
      score: score,
      score_band: scoreBand,
      profile_label: profileLabel,
      tags: tags
    };

    // POST to backend (fire and forget)
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function(err) {
      console.warn('Scorecard POST failed:', err.message);
    });

    // Show results
    wizard.hidden = true;
    resultDiv.hidden = false;

    document.getElementById('resultScore').textContent = score;
    document.getElementById('resultBand').textContent = scoreBand;
    document.getElementById('resultProfile').textContent = profileLabel;
    document.getElementById('resultBookBtn').href = calendlyUrl;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Countdown redirect
    var countdown = 5;
    var countdownEl = document.getElementById('redirectCountdown');
    var timer = setInterval(function() {
      countdown--;
      countdownEl.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(timer);
        window.location.href = calendlyUrl;
      }
    }, 1000);
  }

  // Start button
  startBtn.addEventListener('click', function() {
    intro.style.display = 'none';
    wizard.hidden = false;

    // Animate first step in
    var firstStep = steps[0];
    firstStep.classList.add('active');
    void firstStep.offsetHeight;
    firstStep.classList.add('visible');

    updateProgress();
    updateNav();

    wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var firstInput = firstStep.querySelector('input');
    if (firstInput) setTimeout(function() { firstInput.focus(); }, 400);
  });

  // Continue / Get My Score button
  nextBtn.addEventListener('click', function() {
    var stepEl = steps[currentStep - 1];

    if (!validateStep(stepEl)) return;
    collectStepAnswers(stepEl);

    if (currentStep === TOTAL_STEPS) {
      submitScorecard();
    } else {
      goToStep(currentStep + 1, 'forward');
    }
  });

  // Back button
  backBtn.addEventListener('click', function() {
    if (currentStep > 1) {
      goToStep(currentStep - 1, 'backward');
    }
  });

  // Option buttons (auto-advance on click)
  wizard.addEventListener('click', function(e) {
    var optionBtn = e.target.closest('.scorecard__option');
    if (!optionBtn) return;

    var optionsContainer = optionBtn.closest('.scorecard__options');
    var fieldName = optionsContainer.getAttribute('data-name');
    var value = optionBtn.getAttribute('data-value');

    // Mark selected
    optionsContainer.querySelectorAll('.scorecard__option').forEach(function(btn) {
      btn.classList.remove('selected');
    });
    optionBtn.classList.add('selected');

    // Store answer
    answers[fieldName] = value;

    // Auto-advance after brief delay for visual feedback
    setTimeout(function() {
      if (currentStep === TOTAL_STEPS) {
        submitScorecard();
      } else {
        goToStep(currentStep + 1, 'forward');
      }
    }, 300);
  });

  // Clear invalid on input
  wizard.addEventListener('input', function(e) {
    if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
  });
  wizard.addEventListener('change', function(e) {
    if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
  });

  // Enter key advances on text input steps
  wizard.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      nextBtn.click();
    }
  });
})();
