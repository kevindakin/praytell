// GLOBAL VARIABLES
const durationBase = 0.8;
const durationSlow = 1.2;
const durationFast = 0.4;
const easeBase = "power4.inOut";
const NAV_DESKTOP_MQ = "(min-width: 75em)";
if (typeof CustomEase !== "undefined") gsap.registerPlugin(CustomEase);
if (typeof CustomEase !== "undefined")
  CustomEase.create("easeWipe", "0.625, 0.05, 0, 1");
const easeWipe = typeof CustomEase !== "undefined" ? "easeWipe" : easeBase;

// GENERAL

function lenisScroll() {
  window.lenis = new Lenis({
    lerp: 0.08,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

function loader() {
  const tl = gsap.timeline();
  const splits = [];

  // HEADING
  const heading = document.querySelector('[data-load="heading"]');
  if (heading) {
    const h1 = heading.querySelector("h1");
    if (h1) {
      const split = new SplitText(h1, {
        type: "words",
        mask: "words",
        wordsClass: "gsap_split_word",
      });
      splits.push(split);
      gsap.set(heading, { autoAlpha: 1 });
      tl.from(
        split.words,
        {
          yPercent: 100,
          y: "0.2em",
          duration: 1,
          ease: "power4.out",
          stagger: { each: 0.03, from: "random" },
        },
        0
      );
    }
  }

  // LINES
  const lineEls = document.querySelectorAll('[data-load="lines"]');
  if (lineEls.length) {
    lineEls.forEach((el) => {
      const split = new SplitText(el, { type: "lines" });
      splits.push(split);
      tl.from(
        split.lines,
        {
          opacity: 0,
          y: "1em",
          duration: 1,
          ease: "power4.out",
          stagger: 0.02,
        },
        0.2
      );
    });
  }

  // FADE UP
  const fadeUp = document.querySelectorAll('[data-load="fade-up"]');
  if (fadeUp.length) {
    tl.from(
      fadeUp,
      { opacity: 0, y: "3em", duration: 1, ease: "power4.out", stagger: 0.1 },
      0.2
    );
  }

  // FADE IN
  const fadeIn = document.querySelectorAll('[data-load="fade-in"]');
  if (fadeIn.length) {
    tl.from(
      fadeIn,
      { opacity: 0, duration: 1.5, ease: "power4.out", stagger: 0.1 },
      0.4
    );
  }

  return tl;
}

function pageTransition() {
  const wrap = document.querySelector('[data-transition="wrap"]');
  if (!wrap) return;
  const panel = wrap.querySelector('[data-transition="panel"]');
  const logo = wrap.querySelector('[data-transition="logo"]');
  const paths = logo.querySelectorAll("path");
  const main = document.querySelector('[data-transition="main"]');

  const hasLoad = document.querySelector(
    '[data-load="heading"], [data-load="lines"], [data-load="fade-up"], [data-load="fade-in"]'
  );

  // ENTRANCE
  const reveal = gsap.timeline({
    defaults: { ease: easeWipe },
    onComplete: () => {
      gsap.set(wrap, { display: "none" });
      if (main) gsap.set(main, { clearProps: "transform" });
      // window.scrollTo(0, 0);
      // window.lenis?.scrollTo(0, { immediate: true });
      window.lenis?.resize?.();
      ScrollTrigger.refresh();
    },
  });
  reveal.set(
    panel,
    { top: 0, bottom: "auto", height: "100%", borderRadius: "0 0 0 0" },
    0
  );
  reveal.to(
    paths,
    {
      yPercent: -130,
      duration: durationBase,
      ease: "power4.in",
      stagger: { each: 0.025, from: "random" },
    },
    0.05
  );
  reveal.to(
    panel,
    { borderRadius: "0 0 70% 70%", duration: durationBase * 0.5 },
    0.8
  );
  reveal.to(panel, { height: "0%", duration: durationBase }, 0.8);
  reveal.to(
    panel,
    { borderRadius: "0 0 0 0", duration: durationBase * 0.5 },
    0.8 + durationBase * 0.5
  );
  // Signal the hero (and anything else) that the curtain is lifting — sync point.
  reveal.call(
    () => window.dispatchEvent(new Event("wipe:revealed")),
    null,
    1.1
  );
  if (hasLoad) reveal.add(loader(), 1.1);
  if (main) reveal.from(main, { y: "15dvh", duration: durationBase }, 0.7);

  // EXIT
  let busy = false;
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link || busy) return;

    const href = link.getAttribute("href");
    const url = new URL(href, location.href);
    if (
      url.origin !== location.origin ||
      link.target === "_blank" ||
      link.hasAttribute("download") ||
      href.startsWith("#") ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      url.pathname === location.pathname ||
      [...url.searchParams.keys()].some(
        (k) => k.includes("_page") || k === "page"
      )
    )
      return;

    e.preventDefault();
    busy = true;

    gsap.set(wrap, { display: "block" });
    gsap.set(panel, {
      top: "auto",
      bottom: 0,
      height: "0%",
      borderRadius: "70% 70% 0 0",
    });
    gsap.set(paths, { yPercent: 130 });

    const cover = gsap.timeline({
      defaults: { ease: easeWipe },
      onComplete: () => (window.location.href = url.href),
    });
    cover.to(
      panel,
      { height: "100%", borderRadius: "0 0 0 0", duration: durationBase },
      0
    );
    cover.to(
      paths,
      {
        yPercent: 0,
        duration: durationBase,
        ease: "power4.out",
        stagger: { each: 0.05, from: "random" },
      },
      0.2
    );
    if (main) cover.to(main, { y: "-15dvh", duration: durationBase }, 0);
  });
}

function tabMessage() {
  const originalTitle = document.title;
  const awayMessages = [
    "Come back! We miss you 🥺",
    "Hey, where'd you go? 👀",
    "Your other tabs could never 💁‍♀️",
    "Tabbing out already? 🙄",
    "Psst... over here 👋",
  ];
  let lastIndex = -1;
  let timer = null;
  let showingAway = false;

  function pickMessage() {
    let i;
    do {
      i = Math.floor(Math.random() * awayMessages.length);
    } while (i === lastIndex && awayMessages.length > 1);
    lastIndex = i;
    return awayMessages[i];
  }

  function cycle() {
    showingAway = !showingAway;
    document.title = showingAway ? pickMessage() : originalTitle;
    const delay = 3000;
    timer = setTimeout(cycle, delay);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      showingAway = false;
      cycle();
    } else {
      clearTimeout(timer);
      timer = null;
      document.title = originalTitle;
    }
  });
}

function themeAnimation() {
  const root = document.documentElement;
  const body = document.body;
  if (root.dataset.themeAnimationInit) return;
  root.dataset.themeAnimationInit = "true";

  const PREFIX = "u-theme-";
  const SWAP_MS = 650; // keep in sync with the CSS transition duration
  const drivers = gsap.utils.toArray('[data-theme-animation="yes"]');
  if (!drivers.length) return;

  const themeOf = (el) =>
    [...el.classList].find((c) => c.startsWith(PREFIX)) || null;

  // resting defaults — body is almost certainly u-theme-light
  const rootDefault = themeOf(root);
  const bodyDefault = themeOf(body);

  const stripThemes = (el) => {
    [...el.classList].forEach((c) => {
      if (c.startsWith(PREFIX)) el.classList.remove(c);
    });
  };

  const setTheme = (el, themeClass) => {
    stripThemes(el);
    if (themeClass) el.classList.add(themeClass);
  };

  let swapTimer;
  const beginSwap = () => {
    root.classList.add("is-theming");
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => root.classList.remove("is-theming"), SWAP_MS);
  };

  let current = bodyDefault; // what the page is showing right now

  const apply = (themeClass) => {
    if (!themeClass || themeClass === current) return;
    beginSwap();
    setTheme(root, themeClass);
    setTheme(body, themeClass);
    current = themeClass;
  };

  const release = () => {
    if (current === bodyDefault) return;
    beginSwap();
    setTheme(root, rootDefault); // restore html's original
    setTheme(body, bodyDefault); // restore u-theme-light on body
    current = bodyDefault;
  };

  drivers.forEach((section) => {
    const theme = themeOf(section);
    if (!theme) return;
    ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      end: "bottom center",
      onEnter: () => apply(theme),
      onEnterBack: () => apply(theme),
      onLeave: release,
      onLeaveBack: release,
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

function disableScroll() {
  document.body.classList.add("no-scroll");
}

function enableScroll() {
  document.body.classList.remove("no-scroll");
}

function isMenuOpen() {
  const nav = document.querySelector('[data-menu="wrap"]');
  return Boolean(nav?.classList.contains("is-open"));
}

function navScroll() {
  const navComponent = document.querySelector('[data-menu="wrap"]');
  const trigger = document.querySelector('[data-menu="trigger"]');
  if (!navComponent) return;

  let navHidden = false;
  let activeTween = null;
  let canHide = false; // gate: stays false until we're past the trigger

  function showNav() {
    if (activeTween) activeTween.kill();
    navHidden = false;
    activeTween = gsap.to(navComponent, {
      y: "0%",
      duration: durationSlow,
      ease: easeBase,
      onComplete: () => (activeTween = null),
    });
  }

  // Only create the gate when a trigger exists.
  if (trigger) {
    ScrollTrigger.create({
      trigger: trigger,
      start: "bottom top", // hero fully scrolled past the top edge
      onEnter: () => (canHide = true),
      onLeaveBack: () => {
        // scrolled back up into the hero
        canHide = false;
        if (navHidden) showNav(); // never leave it hidden over the hero
      },
    });
  }

  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      if (isMenuOpen()) {
        if (activeTween) activeTween.kill();
        gsap.set(navComponent, { y: "0%" });
        navHidden = false;
        return;
      }

      const scrollDistance = self.scroll();
      const navRect = navComponent.getBoundingClientRect();
      const scrollingUp = self.direction === -1;

      // Trigger present → gated by ScrollTrigger. Absent → old height fallback.
      const allowHide = trigger ? canHide : scrollDistance > navRect.height;

      if (scrollDistance === 0) {
        navComponent.classList.remove("is-scrolled");
      }

      if (!scrollingUp && !navHidden && allowHide) {
        if (activeTween) activeTween.kill();
        navHidden = true;
        activeTween = gsap.to(navComponent, {
          y: "-100%",
          duration: durationSlow,
          ease: easeBase,
          onComplete: () => {
            navComponent.classList.add("is-scrolled");
            activeTween = null;
          },
        });
      } else if (scrollingUp && navHidden) {
        showNav();
      }
    },
  });
}

function navDropdownDesktop(nav) {
  const items = nav.querySelectorAll('[data-dropdown="wrap"]');
  if (!items.length) return;

  const EDGE_GAP = 48;
  const OFFSET = "2rem";
  const DIRECTION_MODE = "trigger"; // "trigger" | "cursor"
  const CLOSE_DELAY = 50;

  const ac = new AbortController();
  const { signal } = ac;
  const teardowns = [];

  const negateOffset = (v) => (v.startsWith("-") ? v.slice(1) : `-${v}`);

  let lastPointerX = null;
  if (DIRECTION_MODE === "cursor") {
    window.addEventListener(
      "pointermove",
      (e) => {
        lastPointerX = e.clientX;
      },
      { passive: true, signal }
    );
  }

  const positionMenu = (menu) => {
    const wrap = menu.closest(".dropdown_wrap");
    if (!wrap) return;

    wrap.style.left = "";

    const vw = document.documentElement.clientWidth;
    const rightBound = vw - EDGE_GAP;
    const rect = menu.getBoundingClientRect();
    const baseLeft = parseFloat(getComputedStyle(wrap).left) || 0;

    const delta = Math.max(0, rect.right - rightBound);
    if (delta > 0) wrap.style.left = `${baseLeft - delta}px`;
  };

  const getFromX = (trigger) => {
    const triggerCenter =
      trigger.getBoundingClientRect().left + trigger.offsetWidth / 2;

    if (DIRECTION_MODE === "cursor" && lastPointerX !== null) {
      return lastPointerX < triggerCenter ? `-${OFFSET}` : OFFSET;
    }
    const navCenter = nav.getBoundingClientRect().left + nav.offsetWidth / 2;
    return triggerCenter < navCenter ? `-${OFFSET}` : OFFSET;
  };

  items.forEach((item) => {
    const link = item.querySelector('[data-dropdown="trigger"]');
    const menu = item.querySelector('[data-dropdown="menu"]');
    const wrap = item.querySelector(".dropdown_wrap");
    if (!link || !menu || !wrap) return;

    const dropdownItems = menu.querySelectorAll('[data-dropdown="item"]');

    let timeout;
    let isOpen = false;
    let currentFromX = OFFSET;

    gsap.set(menu, { autoAlpha: 0, x: OFFSET });
    gsap.set(dropdownItems, { autoAlpha: 0, x: OFFSET });

    const openTl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.6, ease: "power4.out" },
    });
    openTl
      .to(menu, { autoAlpha: 1, x: "0rem" })
      .to(
        dropdownItems,
        { autoAlpha: 1, x: "0rem", stagger: { each: 0.03, from: "random" } },
        0.1
      );

    const closeTl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.4, ease: "power4.out" },
      onComplete: () => {
        gsap.set(menu, { display: "none" });
      },
    });
    closeTl
      .to(dropdownItems, { autoAlpha: 0, duration: 0.2 }, 0)
      .to(menu, { autoAlpha: 0, x: () => negateOffset(currentFromX) }, 0.05);

    const openMenu = () => {
      clearTimeout(timeout);
      if (isOpen) return;
      isOpen = true;
      closeTl.pause();

      menu.style.pointerEvents = "";
      gsap.set(menu, { display: "flex" });
      positionMenu(menu);

      currentFromX = getFromX(link);
      gsap.set(menu, { x: currentFromX });
      gsap.set(dropdownItems, { x: currentFromX });

      openTl.invalidate();
      requestAnimationFrame(() => openTl.restart());
    };

    const closeMenu = () => {
      isOpen = false;
      openTl.pause();
      menu.style.pointerEvents = "none";
      closeTl.invalidate().restart();
    };

    item.addEventListener("mouseenter", openMenu, { signal });
    menu.addEventListener("mouseenter", openMenu, { signal });
    item.addEventListener(
      "mouseleave",
      () => {
        timeout = setTimeout(closeMenu, CLOSE_DELAY);
      },
      { signal }
    );

    teardowns.push(() => {
      clearTimeout(timeout);
      openTl.kill();
      closeTl.kill();
      gsap.set([menu, ...dropdownItems], { clearProps: "all" });
      menu.style.removeProperty("pointer-events");
      wrap.style.removeProperty("left");
    });
  });

  return () => {
    ac.abort();
    teardowns.forEach((fn) => fn());
  };
}

function navDropdownMobile(nav) {
  const content = nav.querySelector(".nav_content");
  const track = nav.querySelector(".nav_track");
  const items = nav.querySelectorAll('[data-dropdown="wrap"]');
  if (!content || !track || !items.length) return;

  const SLIDE_DUR = 0.6;
  const SLIDE_EASE = "power4.inOut";
  const FOCUSABLE = "a, button";

  const ac = new AbortController();
  const { signal } = ac;

  const panelOneFocusables = [...track.querySelectorAll(FOCUSABLE)].filter(
    (el) => !el.closest(".dropdown_wrap")
  );

  const setInactive = (els, inactive) => {
    els.forEach((el) => {
      if (inactive) el.setAttribute("tabindex", "-1");
      else el.removeAttribute("tabindex");
    });
  };

  const panels = [...items]
    .map((item) => {
      const trigger = item.querySelector('[data-dropdown="trigger"]');
      const wrap = item.querySelector(".dropdown_wrap");
      const back = item.querySelector('[data-dropdown="back"]');
      if (!trigger || !wrap || !back) return null;

      const toggle = trigger.querySelector(".clickable_btn") || trigger;
      const focusables = [...wrap.querySelectorAll(FOCUSABLE)];

      if (!wrap.id)
        wrap.id = `nav-panel-${Math.random().toString(36).slice(2, 8)}`;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", wrap.id);

      return { item, trigger, wrap, back, toggle, focusables };
    })
    .filter(Boolean);

  let active = null;
  let slideTl = null;
  let lastWidth = window.innerWidth;

  const openPanel = (panel) => {
    if (active) return;
    active = panel;
    panel.item.classList.add("is-active");

    content.scrollTop = 0;
    panel.toggle.setAttribute("aria-expanded", "true");
    setInactive(panelOneFocusables, true);
    setInactive(panel.focusables, false);

    slideTl?.kill();
    gsap.set(content, { height: track.offsetHeight });

    slideTl = gsap.timeline({
      defaults: { duration: SLIDE_DUR, ease: SLIDE_EASE },
    });
    slideTl
      .to(track, { xPercent: -100 }, 0)
      // Track grows too, so .nav_content's scrollHeight never sees the
      // hidden panel's overflow.
      .to(content, { height: panel.wrap.offsetHeight }, 0);
  };

  const closePanel = ({ instant = false, restoreFocus = true } = {}) => {
    if (!active) return;
    const panel = active;
    active = null;

    content.scrollTop = 0;
    panel.toggle.setAttribute("aria-expanded", "false");
    setInactive(panel.focusables, true);
    setInactive(panelOneFocusables, false);

    slideTl?.kill();

    if (instant) {
      panel.item.classList.remove("is-active");
      gsap.set(track, { xPercent: 0 });
      gsap.set(content, { height: "auto" });
      return;
    }

    slideTl = gsap.timeline({
      defaults: { duration: SLIDE_DUR, ease: SLIDE_EASE },
      onComplete: () => {
        // Deferred: the panel is display:none once inactive, so removing the
        // class early would blank it mid-slide.
        panel.item.classList.remove("is-active");
        gsap.set(content, { height: "auto" });
        if (restoreFocus) panel.toggle.focus({ preventScroll: true });
      },
    });
    slideTl
      .to(track, { xPercent: 0 }, 0)
      .to(content, { height: track.offsetHeight }, 0);
  };

  panels.forEach((panel) => {
    setInactive(panel.focusables, true);

    panel.trigger.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        openPanel(panel);
      },
      { signal }
    );

    panel.back.addEventListener("click", () => closePanel(), { signal });
  });

  // Width-only guard: iOS Safari fires resize on URL-bar collapse.
  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;

      if (active) gsap.set(content, { height: active.wrap.offsetHeight });
    },
    { signal }
  );

  return {
    hasActivePanel: () => Boolean(active),
    closePanel,
    destroy: () => {
      ac.abort();
      slideTl?.kill();
      setInactive(panelOneFocusables, false);
      panels.forEach((p) => {
        p.item.classList.remove("is-active");
        setInactive(p.focusables, false);
        p.toggle.removeAttribute("aria-expanded");
        p.toggle.removeAttribute("aria-controls");
      });
      gsap.set(track, { clearProps: "all" });
      gsap.set(content, { clearProps: "height" });
    },
  };
}

function navLinkHover() {
  const pill = document.querySelector("[data-nav-pill]");
  if (!pill) return;

  const menu = pill.closest(".nav_menu");
  if (!menu) return;

  const items = menu.querySelectorAll('[data-menu="item"]');
  if (!items.length) return;

  const DESKTOP_MQ = window.matchMedia("(min-width: 75em)");
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");

  const INSET_X = 0.75;
  const INSET_Y = 0.5;
  const rem = () =>
    parseFloat(getComputedStyle(document.documentElement).fontSize);

  const moveDur = () => (REDUCED.matches ? 0 : 0.6);
  const fadeDur = () => (REDUCED.matches ? 0 : 0.2);

  let active = false;
  let positioned = false;

  const setStaticGeometry = () => {
    const r = rem();
    const menuRect = menu.getBoundingClientRect();
    const itemRect = items[0].getBoundingClientRect();
    gsap.set(pill, {
      height: itemRect.height + INSET_Y * 2 * r,
      y: itemRect.top - menuRect.top - INSET_Y * r,
    });
  };

  const positionPill = (item, instant) => {
    const r = rem();
    const menuRect = menu.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    gsap.to(pill, {
      x: itemRect.left - menuRect.left - INSET_X * r,
      width: itemRect.width + INSET_X * 2 * r,
      duration: instant ? 0 : moveDur(),
      ease: "power4.out",
      overwrite: "auto",
    });
  };

  const enterItem = (item) => {
    positionPill(item, !positioned);
    positioned = true;
    if (!active) {
      active = true;
      gsap.to(pill, {
        autoAlpha: 1,
        duration: fadeDur(),
        ease: "power4.out",
        overwrite: "auto",
      });
    }
  };

  const leaveMenu = () => {
    active = false;
    gsap.to(pill, {
      autoAlpha: 0,
      duration: fadeDur(),
      ease: "power4.out",
      overwrite: "auto",
    });
  };

  gsap.set(pill, { autoAlpha: 0 });
  setStaticGeometry();

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      if (DESKTOP_MQ.matches) enterItem(item);
    });
  });

  menu.addEventListener("mouseleave", () => {
    if (DESKTOP_MQ.matches) leaveMenu();
  });

  let lastW = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    setStaticGeometry();
  });
}

function buttonHover() {
  const buttons = document.querySelectorAll('[data-button-hover="wrap"]');

  buttons.forEach((btn) => {
    const fill = btn.querySelector('[data-button-hover="clip"]');
    const proxy = { r: 0, x: 0, y: 0 };
    let tween;

    const render = () => {
      fill.style.clipPath = `circle(${proxy.r}px at ${proxy.x}px ${proxy.y}px)`;
    };

    const getPos = (e) => {
      const rect = btn.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        w: rect.width,
        h: rect.height,
      };
    };

    const coverRadius = (x, y, w, h) =>
      Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

    btn.addEventListener("mouseenter", (e) => {
      const { x, y, w, h } = getPos(e);
      if (tween) tween.kill();
      proxy.r = 0;
      proxy.x = x;
      proxy.y = y;
      tween = gsap.to(proxy, {
        r: coverRadius(x, y, w, h),
        duration: 0.8,
        ease: "power4.out",
        onUpdate: render,
      });
    });

    btn.addEventListener("mouseleave", (e) => {
      const { x, y } = getPos(e);
      if (tween) tween.kill();
      tween = gsap.to(proxy, {
        r: 0,
        x: x,
        y: y,
        duration: 0.8,
        ease: "power4.out",
        onUpdate: render,
      });
    });
  });
}

function copyright() {
  const copyrightDate = document.querySelector(
    '[data-element="copyright-date"]'
  );

  if (copyrightDate) {
    const currentYear = new Date().getFullYear();
    copyrightDate.textContent = currentYear;
  }
}

// SCROLL ANIMATIONS

function imageReveal() {
  const wrappers = document.querySelectorAll('[data-scroll="image-reveal"]');
  if (!wrappers.length) return;

  wrappers.forEach((wrap) => {
    const image = wrap.querySelector(".u-cover-absolute");

    let tl = gsap.timeline({
      defaults: {
        ease: "power4.out",
        duration: 1.2,
      },
      scrollTrigger: {
        trigger: wrap,
        start: "top bottom",
        toggleActions: "play none none reset",
      },
    });

    tl.from(
      image,
      {
        scale: 1.3,
        filter: "blur(3px)",
      },
      0.2
    );
  });
}

// MOBILE MENU

function mobileMenu() {
  const nav = document.querySelector('[data-menu="wrap"]');
  if (!nav || nav.dataset.scriptInitialized) return;
  nav.dataset.scriptInitialized = "true";

  const menu = nav.querySelector(".nav_content");
  const track = nav.querySelector(".nav_track");
  const overlay = nav.querySelector(".nav_overlay");
  const button = nav.querySelector('[data-menu="button"]');
  const closers = nav.querySelectorAll('[data-menu="close"]');
  const buttonText = button.querySelector(".nav_btn_text");

  const links = [...menu.querySelectorAll('[data-menu="item"]')].map(
    (el) => el.querySelector('[data-dropdown="trigger"]') || el
  );

  const DEBUG = true;

  const OPEN_DUR = 0.8;
  const CLOSE_DUR = 0.8;
  const RADIUS_BULGE = 160;
  const TRACK_LAG = "-2rem";
  const ANCHOR_SCROLL_DELAY = 0.15;

  let restRadius = 16;
  const clip = { bottom: 100, radius: 16 };

  const render = () => {
    menu.style.clipPath = `inset(0% 0% ${clip.bottom}% 0% round 0px 0px ${clip.radius}px ${clip.radius}px)`;
  };

  let menuOpen = false;
  let mobilePanels = null;

  const openTl = gsap.timeline({
    paused: true,
    onUpdate: render,
    onStart: () => {
      restRadius =
        parseFloat(getComputedStyle(menu).borderBottomLeftRadius) || 16;
      clip.bottom = 100;
      clip.radius = restRadius;
      render();

      gsap.set(menu, { display: "flex" });
      gsap.set(overlay, { display: "block", opacity: 0 });
      gsap.set(links, { y: "2rem", opacity: 0 });
      gsap.set(track, { y: TRACK_LAG });

      nav.classList.add("is-open");
      disableScroll();
    },
    onComplete: () => {
      menu.style.clipPath = "";
      gsap.set(track, { y: 0 });
    },
  });

  openTl
    .to(clip, { bottom: 0, duration: OPEN_DUR, ease: easeWipe }, 0)
    .to(
      clip,
      { radius: RADIUS_BULGE, duration: OPEN_DUR * 0.5, ease: "power2.in" },
      0
    )
    .to(
      clip,
      {
        radius: () => restRadius,
        duration: OPEN_DUR * 0.5,
        ease: "power2.out",
      },
      OPEN_DUR * 0.5
    )
    .to(overlay, { opacity: 1, duration: OPEN_DUR, ease: easeWipe }, 0)
    .to(track, { y: "0rem", duration: OPEN_DUR * 1.1, ease: "power3.out" }, 0.1)
    .to(
      links,
      {
        y: "0rem",
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.05,
      },
      OPEN_DUR * 0.72
    );

  const closeTl = gsap.timeline({
    paused: true,
    defaults: {
      ease: easeWipe,
      duration: CLOSE_DUR,
    },
    onUpdate: render,
    onStart: render,
    onComplete: () => {
      gsap.set(menu, { display: "none" });
      gsap.set(overlay, { display: "none" });
      menu.style.clipPath = "";
      gsap.set(track, { y: 0 });
      nav.classList.remove("is-open");
      mobilePanels?.closePanel({ instant: true, restoreFocus: false });
    },
  });

  closeTl
    .to(clip, { bottom: 100, ease: easeWipe }, 0)
    .to(
      clip,
      { radius: RADIUS_BULGE, duration: CLOSE_DUR * 0.5, ease: "power2.in" },
      0
    )
    .to(
      clip,
      {
        radius: () => restRadius,
        duration: CLOSE_DUR * 0.5,
        ease: "power2.out",
      },
      CLOSE_DUR * 0.5
    )
    .to(overlay, { opacity: 0 }, 0)
    .to(links, { opacity: 0, duration: 0.5, ease: "power3.out" }, 0)
    .to(track, { y: TRACK_LAG, ease: "power3.out" }, 0.1);

  /* ---------- Controls ---------- */

  const openMenu = () => {
    if (menuOpen) return;
    menuOpen = true;
    buttonText.textContent = "Close";
    closeTl.pause();
    openTl.invalidate().restart();
  };

  const closeMenu = () => {
    if (!menuOpen) return;
    menuOpen = false;
    buttonText.textContent = "Menu";
    // Released at the start of the wipe, not the end — an in-menu anchor
    // link needs scroll live immediately.
    enableScroll();
    openTl.pause();
    closeTl.invalidate().restart();
  };

  const toggleMenu = () => (menuOpen ? closeMenu() : openMenu());

  button.addEventListener("click", toggleMenu);
  closers.forEach((el) => el.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    // Escape steps back one level before closing the whole menu.
    if (mobilePanels?.hasActivePanel()) mobilePanels.closePanel();
    else closeMenu();
  });

  /* ---------- In-menu anchor links ---------- */

  // Returns the on-page element a link points at, or null if the link
  // isn't a same-page hash (external, different route, no fragment).
  const resolveHashTarget = (link) => {
    const href = link.getAttribute("href");
    if (!href) return null;

    let url;
    try {
      url = new URL(href, location.href);
    } catch {
      return null;
    }

    if (url.origin !== location.origin) return null;
    if (url.pathname.replace(/\/$/, "") !== location.pathname.replace(/\/$/, ""))
      return null;
    if (!url.hash || url.hash === "#") return null;

    const target = document.querySelector(url.hash);
    if (!target && DEBUG) {
      console.warn(`[mobileMenu] No element matches ${url.hash} on this page.`);
    }
    return target;
  };

  nav.addEventListener("click", (e) => {
    if (!menuOpen) return;

    const link = e.target.closest("a[href]");
    if (!link || !nav.contains(link)) return;

    const target = resolveHashTarget(link);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation(); // don't let a global anchor handler double-scroll

    closeMenu();

    gsap.delayedCall(ANCHOR_SCROLL_DELAY, () => {
      if (window.lenis) window.lenis.scrollTo(target);
      else target.scrollIntoView({ behavior: "smooth" });
      if (target.id) history.replaceState(null, "", `#${target.id}`);
    });
  });

  /* ---------- Breakpoint routing ---------- */

  const mm = gsap.matchMedia();

  mm.add(NAV_DESKTOP_MQ, () => navDropdownDesktop(nav));

  mm.add(`not all and ${NAV_DESKTOP_MQ}`, () => {
    mobilePanels = navDropdownMobile(nav);

    return () => {
      mobilePanels?.destroy();
      mobilePanels = null;

      // Synchronous reset — the timelines are async, and clearProps below
      // must not run against a live tween.
      openTl.pause(0);
      closeTl.pause(0);
      if (menuOpen) {
        menuOpen = false;
        buttonText.textContent = "Menu";
        nav.classList.remove("is-open");
        enableScroll();
      }
      menu.style.clipPath = "";
      gsap.set([menu, overlay, track, ...links], { clearProps: "all" });
    };
  });
}

document.addEventListener("DOMContentLoaded", function () {
  lenisScroll();
  pageTransition();
  tabMessage();
  themeAnimation();
  navScroll();
  copyright();
  imageReveal();
  mobileMenu();

  gsap.matchMedia().add("(width > 74.9em)", () => {
    navLinkHover();
  });

  gsap.matchMedia().add("(width > 991px)", () => {
    buttonHover();
  });
});