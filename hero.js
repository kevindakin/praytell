document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".hero_home_wrap").forEach((component) => {
    if (component.dataset.scriptInitialized) return;
    component.dataset.scriptInitialized = "true";

    const wrap = component;
    const section = wrap.closest(".hero_section") || wrap;
    const card = wrap.querySelector(".hero_home_card");
    const media = wrap.querySelector(".hero_home_media");
    const content = wrap.querySelector(".hero_home_content");
    const cursor = wrap.querySelector(".hero_home_cursor");
    const video = wrap.querySelector(".hero_home_video");
    const source = video ? video.querySelector("source") : null;
    const stills = Array.from(wrap.querySelectorAll(".hero_home_still"));

    const setVar = (el, name, val) => el.style.setProperty(name, val);

    let progress = 0;
    let isExpanded = false;
    let isPlaying = false;
    let desktopInteractive = false;
    const pointer = { x: 0, y: 0, inCard: false };

    window.addEventListener("pointermove", (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      const r = card.getBoundingClientRect();
      pointer.inCard =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
    });

    let stillsTl = null;
    const HOLD = 0.6,
      FADE = 0;

    function buildStillsLoop() {
      if (stills.length < 2) return;
      gsap.set(stills, { opacity: 0, zIndex: 1 });
      gsap.set(stills[0], { opacity: 1, zIndex: 2 });
      stillsTl = gsap.timeline({ repeat: -1, delay: 1.4 });
      stills.forEach((current, i) => {
        const next = stills[(i + 1) % stills.length];
        stillsTl
          .set(next, { zIndex: 2, opacity: 0 }, `+=${HOLD}`)
          .set(current, { zIndex: 1 }, "<")
          .to(next, { opacity: 1, duration: FADE, ease: "power4.out" }, "<")
          .set(current, { opacity: 0 }, ">");
      });
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!stillsTl) return;
        if (entry.isIntersecting && !isPlaying) stillsTl.play();
        else stillsTl.pause();
      },
      { threshold: 0 }
    );
    io.observe(section);

    // ===== VIDEO =====
    function playVideo() {
      if (!source || !source.getAttribute("src")) return;
      isPlaying = true;
      card.classList.add("is-playing");
      if (stillsTl) stillsTl.pause();
      gsap.to(video, { opacity: 1, duration: 0.2, ease: "power4.out" });
      video.play().catch(() => {});
      if (cursor) cursor.textContent = "Pause";
    }
    function pauseVideo(reset) {
      isPlaying = false;
      card.classList.remove("is-playing");
      video.pause();
      if (reset) video.currentTime = 0;
      gsap.to(video, { opacity: 0, duration: 0.2, ease: "power4.out" });
      if (stillsTl) stillsTl.play();
      if (cursor) cursor.textContent = "Watch now";
    }

    card.addEventListener("click", () => {
      const flat = !desktopInteractive;
      if (!(isExpanded || flat)) return;
      isPlaying ? pauseVideo(false) : playVideo();
    });

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      buildStillsLoop();
      return () => {
        if (stillsTl) {
          stillsTl.kill();
          stillsTl = null;
        }
      };
    });

    mm.add(
      "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
      () => {
        desktopInteractive = true;
        gsap.set(media, { "--load-h": 0, "--load-w": 0 });
        function buildIntro() {
          return gsap
            .timeline()
            .to(media, { "--load-h": 1, duration: 0.7, ease: "power4.inOut" })
            .to(
              media,
              { "--load-w": 1, duration: 0.7, ease: "power4.inOut" },
              0.35
            );
        }

        if (!window.__heroIntroPlayed) {
          window.__heroIntroPlayed = true;
          gsap.delayedCall(0.3, buildIntro);
        }

        const st = ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const raw = self.progress;

            // grow completes at 70% of the scroll, holds full for the last 30%
            const GROW_END = 0.7;
            progress = gsap.utils.clamp(0, 1, raw / GROW_END);

            setVar(media, "--grow", progress);

            const r = gsap.utils.clamp(0, 1, (progress - 0.82) / 0.18);
            setVar(media, "--grow-r", r);

            const o = gsap.utils.clamp(0, 1, 1 - progress / 0.45);
            content.style.opacity = o;
            content.style.transform = `translateY(${(1 - o) * -24}px)`;

            const wasExpanded = isExpanded;
            isExpanded = progress > 0.985;
            card.classList.toggle("is-expanded", isExpanded);
            if (wasExpanded && !isExpanded && isPlaying) pauseVideo(true);
          },
          onLeave: () => {
            if (isPlaying) pauseVideo(true);
          },
          onLeaveBack: () => {
            if (isPlaying) pauseVideo(true);
          },
        });

        let mx = 0,
          my = 0,
          cx = pointer.x,
          cy = pointer.y,
          cursorShown = 0;
        const MAG = 80,
          EASE = 0.5;

        const tick = () => {
          let tx = 0,
            ty = 0;
          if (progress < 0.02 && pointer.inCard) {
            const r = card.getBoundingClientRect();
            const nx = gsap.utils.clamp(
              -1,
              1,
              (pointer.x - (r.left + r.width / 2)) / (r.width / 2)
            );
            const ny = gsap.utils.clamp(
              -1,
              1,
              (pointer.y - (r.top + r.height / 2)) / (r.height / 2)
            );
            tx = nx * MAG;
            ty = ny * MAG;
          }
          mx += (tx - mx) * EASE;
          my += (ty - my) * EASE;
          setVar(media, "--pill-dx", mx.toFixed(2) + "px");
          setVar(media, "--pill-dy", my.toFixed(2) + "px");

          const show = isExpanded && pointer.inCard ? 1 : 0;
          cursorShown += (show - cursorShown) * 0.2;
          cx += (pointer.x - cx) * 0.18;
          cy += (pointer.y - cy) * 0.18;
          cursor.style.opacity = cursorShown.toFixed(3);
          cursor.style.transform = `translate3d(${cx.toFixed(
            1
          )}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
        };
        gsap.ticker.add(tick);

        return () => {
          desktopInteractive = false;
          gsap.ticker.remove(tick);
          st.kill();
          setVar(media, "--grow", 0);
          setVar(media, "--grow-r", 0);
          setVar(media, "--load-h", 1);
          setVar(media, "--load-w", 1);
          setVar(media, "--pill-dx", "0px");
          setVar(media, "--pill-dy", "0px");
          content.style.opacity = "";
          content.style.transform = "";
          cursor.style.opacity = 0;
          card.classList.remove("is-expanded");
          progress = 0;
          isExpanded = false;
        };
      }
    );

    window.addEventListener("load", () => ScrollTrigger.refresh());
  });
});