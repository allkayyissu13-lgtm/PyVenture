import { useEffect, useRef, useState } from "react";
import { slugify } from "../data/competitions.js";
import "./NewCompetitionDialog.css";

const TITLE_MAX = 60;
const SUBTITLE_MAX = 140;

export default function NewCompetitionDialog({ onCancel, onCreate }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [creator, setCreator] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);

  const dialogRef = useRef(null);
  const titleRef = useRef(null);

  // URL dibuat otomatis dari judul, kecuali sudah diubah lewat tombol Edit
  const finalSlug = slugEdited ? slug : slugify(title);

  // Fokus ke isian pertama, kunci scroll halaman, lalu kembalikan fokus saat ditutup
  useEffect(() => {
    const prev = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (prev && prev.focus) prev.focus();
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel();
      return;
    }
    if (e.key !== "Tab") return;
    // jaga fokus tetap di dalam dialog
    const nodes = dialogRef.current.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const toggleSlugEdit = () => {
    if (!editingSlug) {
      setSlug(finalSlug);
      setSlugEdited(true);
    }
    setEditingSlug((v) => !v);
  };

  const submit = (e) => {
    e.preventDefault();
    onCreate({ title, subtitle, slug: finalSlug, creator, privacy });
  };

  return (
    <div
      className="nc-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="nc-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nc-heading"
        ref={dialogRef}
        onKeyDown={onKeyDown}
      >
        {/* Sisi kiri: salinan judul halaman */}
        <aside className="nc-aside" aria-hidden="true">
          <span className="nc-badge">
            <i /> Arena Kompetisi
          </span>
          <p className="nc-aside-title">Arena Kompetisi &amp; Turnamen Koding</p>
          <p className="nc-aside-text">
            Tantang kemampuan sintaksis, kecepatan algoritma, dan optimasi Big-O realtime. Setiap
            kompetisi dilengkapi papan peringkat independen terverifikasi runtime.
          </p>
        </aside>

        {/* Sisi kanan: form */}
        <form className="nc-panel" onSubmit={submit}>
          <header className="nc-bar">
            <button type="button" className="nc-close" onClick={onCancel} aria-label="Tutup">
              ×
            </button>
            <h2 id="nc-heading">New Competitions</h2>
          </header>

          <div className="nc-body">
            <h3 className="nc-section">Enter Competition Details</h3>

            <div className="nc-field">
              <label htmlFor="nc-title">New Title*</label>
              <input
                id="nc-title"
                ref={titleRef}
                className="nc-input"
                type="text"
                placeholder="Enter a descriptive title"
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className="nc-count">
                {title.length}/{TITLE_MAX}
              </span>
            </div>

            <div className="nc-url">
              <span className="nc-url-label">Competition URL *</span>
              <div className="nc-url-row">
                <span className="nc-url-prefix">pyventure/kompetisi/</span>
                {editingSlug ? (
                  <input
                    className="nc-url-input"
                    value={slug}
                    aria-label="Alamat URL kompetisi"
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    autoFocus
                  />
                ) : (
                  <span className="nc-url-slug">{finalSlug || "..."}</span>
                )}
                <button type="button" className="nc-edit" onClick={toggleSlugEdit}>
                  {editingSlug ? "Selesai" : "Edit"}
                </button>
              </div>
            </div>

            <div className="nc-field">
              <label htmlFor="nc-subtitle">Subtitle*</label>
              <input
                id="nc-subtitle"
                className="nc-input"
                type="text"
                placeholder="Enter a subtitle explaining what competitors will do"
                value={subtitle}
                maxLength={SUBTITLE_MAX}
                onChange={(e) => setSubtitle(e.target.value)}
                required
              />
              <span className="nc-count">
                {subtitle.length}/{SUBTITLE_MAX}
              </span>
            </div>

            <div className="nc-field">
              <label htmlFor="nc-creator">Creating as</label>
              <input
                id="nc-creator"
                className="nc-input"
                type="text"
                placeholder="(Your Name)"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                required
              />
            </div>

            <fieldset className="nc-privacy">
              <legend className="nc-section">Privacy, Access &amp; Resources</legend>
              <div className="nc-options">
                <label className={"nc-option" + (privacy === "public" ? " is-checked" : "")}>
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={privacy === "public"}
                    onChange={() => setPrivacy("public")}
                  />
                  <strong>Public</strong>
                  <span>Anyone can view, read the notebooks, and join</span>
                </label>
                <label className={"nc-option" + (privacy === "private" ? " is-checked" : "")}>
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={privacy === "private"}
                    onChange={() => setPrivacy("private")}
                  />
                  <strong>Private</strong>
                  <span>Only invited people can view and join</span>
                </label>
              </div>
            </fieldset>
          </div>

          <footer className="nc-actions">
            <button type="button" className="nc-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="nc-btn is-primary">
              Create Competitions
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}