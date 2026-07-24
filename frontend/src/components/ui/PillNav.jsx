import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const PillNav = ({
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#fff",
  pillColor = "#120F17",
  hoveredPillTextColor = "#120F17",
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector(".pill-label");
        const white = pill.querySelector(".pill-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }
        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    if (document.fonts?.ready) document.fonts.ready.then(layout).catch(() => {});

    const menu = mobileMenuRef.current;
    if (menu) gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1 });

    if (initialLoadAnimation && navItemsRef.current) {
      gsap.set(navItemsRef.current, { width: 0, overflow: "hidden" });
      gsap.to(navItemsRef.current, { width: "auto", duration: 0.6, ease });
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i) => {
    const tl = tlRefs.current[i]; if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: "auto" });
  };
  const handleLeave = (i) => {
    const tl = tlRefs.current[i]; if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: "auto" });
  };
  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;
    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }
    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(menu, { opacity: 0, y: 10, scaleY: 1 }, { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease, transformOrigin: "top center" });
      } else {
        gsap.to(menu, { opacity: 0, y: 10, scaleY: 1, duration: 0.2, ease, transformOrigin: "top center", onComplete: () => gsap.set(menu, { visibility: "hidden" }) });
      }
    }
    onMobileMenuClick?.();
  };

  const cssVars = {
    "--pn-base": baseColor,
    "--pn-pill-bg": pillColor,
    "--pn-hover-text": hoveredPillTextColor,
    "--pn-pill-text": resolvedPillTextColor,
  };

  const pillClass =
    "pill relative inline-flex h-full items-center justify-center overflow-hidden rounded-full px-[18px] text-[16px] font-semibold uppercase tracking-[0.2px] whitespace-nowrap cursor-pointer no-underline " +
    "bg-[var(--pn-pill-bg)] text-[var(--pn-pill-text)]";

  const renderPillInner = (item, i) => (
    <>
      <span
        className="hover-circle pointer-events-none absolute left-1/2 bottom-0 z-[1] block rounded-full bg-[var(--pn-base)] will-change-transform"
        aria-hidden="true"
        ref={(el) => { circleRefs.current[i] = el; }}
      />
      <span className="label-stack relative z-[2] inline-block leading-none">
        <span className="pill-label relative z-[2] inline-block leading-none will-change-transform">
          {item.label}
        </span>
        <span
          className="pill-label-hover absolute left-0 top-0 inline-block text-[color:var(--pn-hover-text)] will-change-[transform,opacity] z-[3]"
          aria-hidden="true"
        >
          {item.label}
        </span>
      </span>
    </>
  );

  return (
    <div
      className={`pill-nav-container absolute top-4 z-[99] max-md:left-0 max-md:w-full ${className}`}
      style={cssVars}
    >
      <nav
        className="pill-nav flex w-max items-center max-md:w-full max-md:justify-between max-md:bg-transparent max-md:px-4"
        style={{ "--nav-h": "42px" }}
        aria-label="Primary"
      >
        <div
          ref={navItemsRef}
          className="relative hidden h-[42px] items-center rounded-full border border-cream-border bg-cream backdrop-blur-xl md:flex"
        >
          <ul className="m-0 flex h-full list-none items-stretch gap-[3px] p-[3px]">
            {items.map((item, i) => {
              const active = activeHref === item.href;
              return (
                <li key={item.href} className="flex h-full">
                  <a
                    href={item.href}
                    aria-label={item.ariaLabel ?? item.label}
                    className={pillClass + (active ? " is-active" : "")}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    {renderPillInner(item, i)}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="relative flex h-[42px] w-[42px] cursor-pointer flex-col items-center justify-center gap-1 rounded-full border border-cream-border bg-cream p-0 backdrop-blur-xl md:hidden"
        >
          <span className="hamburger-line h-[2px] w-4 rounded-[1px] bg-ink" />
          <span className="hamburger-line h-[2px] w-4 rounded-[1px] bg-ink" />
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        className="mobile-menu-popover invisible absolute left-4 right-4 top-[3em] z-[998] origin-top rounded-[27px] border border-cream-border bg-cream opacity-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden"
      >
        <ul className="m-0 flex list-none flex-col gap-[3px] p-[3px]">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-[50px] bg-[var(--pn-pill-bg)] px-4 py-3 text-[16px] font-medium text-[color:var(--pn-pill-text)] no-underline transition-colors hover:bg-[var(--pn-base)] hover:text-[color:var(--pn-hover-text)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
