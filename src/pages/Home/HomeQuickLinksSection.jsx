import { useState } from "react";
import AddLinkModal from "./AddLinkModal";
import { links } from "./home.constants";
import styles from "./Home.module.css";

function HomeQuickLinksSection() {
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [customLinks, setCustomLinks] = useState([]);

  function handleSaveLink(link) {
    setCustomLinks((current) => [
      ...current,
      {
        ...link,
        label: link.name,
        tone: "black",
        coverPreview: link.cover ? URL.createObjectURL(link.cover) : "",
      },
    ]);
  }

  return (
    <section className={styles.searchLinks} aria-label="Busca e links rapidos">
      <form className={styles.search}>
        <input type="search" placeholder="Pesquise o que quiser..." />
        <button type="submit" aria-label="Pesquisar" />
      </form>

      <section className={styles.links}>
        <h2>Links</h2>
        <div className={styles.linkList}>
          {[...links, ...customLinks].map((link) => (
            <button
              className={`${styles.linkCard} ${styles[link.tone]}`}
              type="button"
              key={link.label}
              onClick={() => link.url && window.open(link.url, "_blank", "noopener,noreferrer")}
            >
              {link.coverPreview ? (
                <img className={styles.customLinkCover} src={link.coverPreview} alt="" />
              ) : (
                <span className={`${styles.linkIcon} ${styles[link.icon] ?? ""}`} />
              )}
              <small>{link.label}</small>
            </button>
          ))}
          <button className={styles.addLink} type="button" onClick={() => setIsAddLinkOpen(true)}>
            <span>+</span>
            <small>Adicionar novo link</small>
          </button>
        </div>
      </section>

      <AddLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onSave={handleSaveLink}
      />
    </section>
  );
}

export default HomeQuickLinksSection;
