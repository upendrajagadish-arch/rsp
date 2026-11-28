"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildPassportGalleryItems, type PassportGalleryItem } from "@/lib/passport/gallery-items";
import type { PassportAchievement, SkillPassportBundle } from "@/lib/passport/types";
import { PassportGalleryScene } from "@/components/passport/passport-gallery-scene";
import { cn } from "@/lib/utils";

type Props = {
  bundle: SkillPassportBundle;
  onOpenAchievement: (a: PassportAchievement | null, lockedCode?: string) => void;
  onBackToCover: () => void;
};

type Mode = "gallery" | "page" | "list";

const SMALL_MQ =
  "(max-width: 819px), (orientation: portrait) and (max-width: 1100px), (orientation: landscape) and (max-height: 500px)";

export function PassportGallery({ bundle, onOpenAchievement, onBackToCover }: Props) {
  const items = useMemo(() => buildPassportGalleryItems(bundle), [bundle]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<PassportGalleryScene | null>(null);
  const dragRef = useRef<{ x: number; y: number; th: number; moved: boolean } | null>(null);

  const [mode, setMode] = useState<Mode>("gallery");
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  const [pageItem, setPageItem] = useState<PassportGalleryItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collection, setCollection] = useState<PassportGalleryItem[]>([]);
  const [pill, setPill] = useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false,
  });
  const [paper, setPaper] = useState("Art Paper");
  const [size, setSize] = useState('11.7 × 16.5" (A3)');
  const [qty, setQty] = useState(1);
  const [hintFocus, setHintFocus] = useState(false);

  const verified = items.filter((i) => i.status === "verified");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const small = window.matchMedia(SMALL_MQ).matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new PassportGalleryScene(canvas, items, small, reduce);
    sceneRef.current = scene;

    let cancelled = false;
    void (async () => {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      await scene.buildPrints(true);
      scene.startIntro();
      setReady(true);
      scene.start();
    })();

    const failsafe = window.setTimeout(() => {
      if (!cancelled) {
        scene.startIntro();
        setReady(true);
        scene.start();
      }
    }, 4000);

    const onResize = () => scene.resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      window.removeEventListener("resize", onResize);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [items]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const scene = sceneRef.current;
      if (!scene) return;
      if (e.key === "Escape") {
        if (drawerOpen) {
          setDrawerOpen(false);
          return;
        }
        if (mode === "page" || mode === "list") {
          closeToGallery(pageItem?.index ?? focused ?? 0);
          return;
        }
        if (focused != null) {
          scene.stepBack();
          setFocused(null);
          setHintFocus(false);
          setPill((p) => ({ ...p, show: false }));
        }
      }
      if (mode !== "gallery") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") scene.snapStep(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") scene.snapStep(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, focused, pageItem, drawerOpen]);

  function closeToGallery(itemIndex: number) {
    setMode("gallery");
    setShowDetails(false);
    setPageItem(null);
    requestAnimationFrame(() => {
      sceneRef.current?.focusNearestOuter(itemIndex);
      setFocused(itemIndex);
      setHintFocus(true);
    });
  }

  function openPage(item: PassportGalleryItem) {
    setPageItem(item);
    setMode("page");
    setShowDetails(false);
    setPill((p) => ({ ...p, show: false }));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => setShowDetails(true), reduce ? 0 : 1000);
  }

  function addToCollection(item: PassportGalleryItem) {
    setCollection((prev) => {
      const existing = prev.find((p) => p.index === item.index);
      if (existing) return prev;
      return [...prev, item];
    });
    setDrawerOpen(true);
  }

  return (
    <div className="pg-root">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,400&family=Oswald:wght@200..700&display=swap"
        rel="stylesheet"
      />

      <header className={cn("pg-nav", mode !== "gallery" && "is-solid")}>
        <button type="button" className="pg-logo" onClick={onBackToCover}>
          Skill Passport
        </button>
        <nav className="pg-links">
          <button type="button" onClick={() => closeToGallery(focused ?? 0)}>
            Gallery
          </button>
          <button type="button" onClick={() => setMode("list")}>
            Collection
          </button>
          <button type="button" onClick={onBackToCover}>
            Cover
          </button>
        </nav>
        <div className="pg-nav-right">
          <span className="pg-meta-pill">{bundle.identity.passportNumber}</span>
          <button
            type="button"
            className="pg-bag-btn"
            aria-label="Open collection drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            {collection.length > 0 ? <span className="pg-bag-badge">{collection.length}</span> : null}
          </button>
        </div>
      </header>

      <main
        id="gallery"
        className={cn("pg-gallery", mode !== "gallery" && "is-dimmed")}
        onWheel={(e) => {
          if (mode !== "gallery") return;
          let dy = e.deltaY;
          if (e.deltaMode === 1) dy *= 33;
          sceneRef.current?.nudgeWalk(-dy * 0.0016);
        }}
        onPointerDown={(e) => {
          if (mode !== "gallery") return;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          dragRef.current = {
            x: e.clientX,
            y: e.clientY,
            th: sceneRef.current?.targetTh ?? 0,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          if (mode !== "gallery" || !dragRef.current) return;
          const dx = e.clientX - dragRef.current.x;
          const dy = e.clientY - dragRef.current.y;
          if (Math.hypot(dx, dy) > 6) dragRef.current.moved = true;
          if (!dragRef.current.moved) return;
          const small = window.matchMedia(SMALL_MQ).matches;
          const scale = small ? 0.0042 : 0.0022;
          const delta = (Math.abs(dx) > Math.abs(dy) ? dx : dy) * scale;
          sceneRef.current?.setTargetTh(dragRef.current.th + delta);
          setPill((p) => ({ ...p, show: false }));
        }}
        onPointerUp={(e) => {
          if (mode !== "gallery") return;
          const drag = dragRef.current;
          dragRef.current = null;
          const scene = sceneRef.current;
          if (!scene || drag?.moved) return;

          const hit = scene.pick(e.clientX, e.clientY);
          if (!hit) {
            if (focused != null) {
              scene.stepBack();
              setFocused(null);
              setHintFocus(false);
              setPill((p) => ({ ...p, show: false }));
            }
            return;
          }

          if (focused === hit.itemIndex) {
            openPage(items[hit.itemIndex]);
            return;
          }

          scene.focusItem(hit.itemIndex, hit.wall, hit.angle);
          setFocused(hit.itemIndex);
          setHintFocus(true);
          setPill({ x: e.clientX, y: e.clientY, show: true });
        }}
      >
        <canvas ref={canvasRef} className={cn("pg-canvas", ready && "is-ready")} />
        <div className={cn("pg-veil", ready && "is-clear")} />
      </main>

      <div className={cn("pg-gui", mode !== "gallery" && "is-hidden")}>
        <div className="pg-arrows">
          <button type="button" aria-label="Previous" onClick={() => sceneRef.current?.snapStep(-1)}>
            ←
          </button>
          <button type="button" aria-label="Next" onClick={() => sceneRef.current?.snapStep(1)}>
            →
          </button>
        </div>

        <div className="pg-hint">
          <span className="pg-mask">
            <span>
              {hintFocus ? "Click the stamp to open it" : "Scroll or drag to walk the corridor"}
            </span>
          </span>
          <span className="pg-mask">
            <span>{hintFocus ? "Esc or click away to step back" : "Click a stamp to look closer"}</span>
          </span>
        </div>

        <div className="pg-toggle">
          <button type="button" className="is-active">
            GALLERY
          </button>
          <button type="button" onClick={() => setMode("list")}>
            LIST
          </button>
        </div>

        <div className="pg-caption">
          <p className="pg-kicker">
            <span className="pg-mask">
              <span>YOU ARE WALKING PAST</span>
            </span>
          </p>
          <h1 className="pg-headline">
            <span className="pg-mask">
              <span>SKILL PASSPORT</span>
            </span>
          </h1>
          <button type="button" className="pg-enter" onClick={() => setMode("list")}>
            <span className="pg-mask">
              <span>ENTER THE COLLECTION →</span>
            </span>
          </button>
        </div>
      </div>

      <div
        className={cn("pg-pill", pill.show && focused != null && "is-on")}
        style={{ left: pill.x, top: pill.y }}
      >
        OPEN THE STAMP
      </div>

      {/* Stamp detail page */}
      <section className={cn("pg-page", mode === "page" && pageItem && "is-open")}>
        {pageItem ? (
          <div className="pg-page-wrap">
            <div className="pg-page-left">
              <div className="pg-page-art" style={{ borderColor: pageItem.colour }}>
                <StampPoster item={pageItem} />
              </div>
              <div className="pg-page-meta">
                <span>1/1</span>
                <span>View in corridor</span>
                <span>{pageItem.stampCode}</span>
              </div>
            </div>
            <div className={cn("pg-page-right", showDetails && "is-shown")}>
              <h2>{pageItem.title}</h2>
              <p className="pg-artist">{pageItem.artist}</p>
              <p className="pg-desc">{pageItem.description}</p>
              <p className="pg-price">{pageItem.priceLabel}</p>
              <p className="pg-tax">
                {bundle.identity.fullName} · {bundle.identity.organizationName}
              </p>

              <OptionGroup
                label="Paper"
                value={paper}
                options={["Art Paper", "Fine Art Paper", "Recycled Paper"]}
                onChange={setPaper}
              />
              <OptionGroup
                label="Size"
                value={size}
                options={[
                  '11.7 × 16.5" (A3)',
                  '16.5 × 23.4" (A2)',
                  '23.4 × 33.1" (A1)',
                  '33.1 × 46.8" (A0)',
                ]}
                onChange={setSize}
              />

              <div className="pg-buy">
                <div className="pg-qty">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    −
                  </button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(9, q + 1))}>
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="pg-add"
                  onClick={() => {
                    addToCollection(pageItem);
                    if (pageItem.achievement) onOpenAchievement(pageItem.achievement);
                    else onOpenAchievement(null, pageItem.stampCode);
                  }}
                >
                  ADD TO COLLECTION
                </button>
              </div>

              <Accordion
                rows={[
                  {
                    title: "Stamp status",
                    body: `Status: ${pageItem.status}. Year: ${pageItem.year}. Code: ${pageItem.stampCode}.`,
                  },
                  {
                    title: "Evidence",
                    body: pageItem.description,
                  },
                  {
                    title: "Institution",
                    body: `${bundle.identity.organizationName}. Booklet ${bundle.identity.passportNumber}.`,
                  },
                ]}
              />
            </div>

            <div className={cn("pg-collection-band", showDetails && "is-shown")}>
              <h3>GET THE COLLECTION</h3>
              <div className="pg-band-row">
                {[0, 1, 2, 3].map((off) => {
                  const it = items[(pageItem.index + off) % items.length];
                  return (
                    <button
                      key={it.index}
                      type="button"
                      className="pg-band-card"
                      onClick={() => openPage(it)}
                    >
                      <StampPoster item={it} compact />
                      <p className="pg-band-title">{it.title}</p>
                      <p className="pg-band-artist">{it.artist}</p>
                      <p className="pg-band-price">{it.priceLabel}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* List */}
      <section className={cn("pg-list", mode === "list" && "is-open")}>
        <h2>SKILL PASSPORT — ALL STAMPS</h2>
        <div className="pg-list-grid">
          {items.map((it) => (
            <button key={it.index} type="button" className="pg-list-card" onClick={() => openPage(it)}>
              <StampPoster item={it} compact />
              <p className="pg-band-title">{it.title}</p>
              <p className="pg-band-artist">{it.artist}</p>
              <p className="pg-band-price">{it.priceLabel}</p>
            </button>
          ))}
        </div>
        <button type="button" className="pg-list-back" onClick={() => closeToGallery(0)}>
          ← Back to gallery
        </button>
      </section>

      {/* Collection drawer */}
      <aside className={cn("pg-drawer", drawerOpen && "is-open")}>
        <div className="pg-drawer-head">
          <h3>YOUR COLLECTION</h3>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close">
            ×
          </button>
        </div>
        <div className="pg-drawer-body">
          {collection.length === 0 ? (
            <p className="pg-drawer-empty">YOUR COLLECTION IS EMPTY</p>
          ) : (
            collection.map((it) => (
              <div key={it.index} className="pg-drawer-item">
                <StampPoster item={it} tiny />
                <div>
                  <p>{it.title}</p>
                  <p className="pg-band-artist">{it.artist}</p>
                  <p className="pg-band-price">{it.priceLabel}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="pg-drawer-foot">
          <div className="pg-subtotal">
            <span>Saved stamps</span>
            <span>{collection.length}</span>
          </div>
          <button type="button" className="pg-checkout" onClick={() => setMode("list")}>
            VIEW ALL →
          </button>
        </div>
      </aside>
    </div>
  );
}

function StampPoster({
  item,
  compact,
  tiny,
}: {
  item: PassportGalleryItem;
  compact?: boolean;
  tiny?: boolean;
}) {
  return (
    <div
      className={cn("pg-poster", compact && "is-compact", tiny && "is-tiny")}
      style={{ ["--stamp" as string]: item.colour }}
    >
      <div className="pg-poster-crest" />
      <p className="pg-poster-title">{item.title}</p>
      <p className="pg-poster-meta">
        {item.artist} · {item.priceLabel}
      </p>
    </div>
  );
}

function OptionGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="pg-opts">
      <p>
        {label}: <span>{value}</span>
      </p>
      <div className="pg-chips">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            className={cn(value === o && "is-on")}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Accordion({ rows }: { rows: { title: string; body: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="pg-acc">
      {rows.map((r, i) => (
        <div key={r.title} className={cn("pg-acc-row", open === i && "is-open")}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)}>
            <span>{r.title}</span>
            <span className="pg-acc-plus">+</span>
          </button>
          <div className="pg-acc-body">
            <p>{r.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
