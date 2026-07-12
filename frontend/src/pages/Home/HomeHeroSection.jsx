import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import bannerImage from "../../assets/images/home/banner.png";
import ProtectedStorageImage from "../../components/Common/ProtectedStorageImage/ProtectedStorageImage";
import { usePortalBanners } from "../../hooks/usePortalBanners";
import { systems } from "./home.constants";
import styles from "./Home.module.css";

const AUTOPLAY_MS = 5000;

function HomeHeroSection() {
  const navigate = useNavigate();
  const { listActive } = usePortalBanners();
  const [activeBanners, setActiveBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    listActive()
      .then((result) => {
        if (ignore) return;
        setActiveBanners(Array.isArray(result) ? result : []);
        setCurrentIndex(0);
      })
      .catch(() => {
        if (ignore) return;
        setActiveBanners([]);
        setCurrentIndex(0);
      });

    return () => {
      ignore = true;
    };
  }, [listActive]);

  useEffect(() => {
    if (activeBanners.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % activeBanners.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [activeBanners]);

  const slides = useMemo(() => {
    if (activeBanners.length) return activeBanners;
    return [{ id: "fallback-banner", title: "", imagePath: "", linkUrl: "" }];
  }, [activeBanners]);

  const activeSlide = slides[currentIndex] ?? slides[0];
  const showCarouselControls = slides.length > 1;

  function goToSlide(index) {
    setCurrentIndex(index);
  }

  function stepSlide(direction) {
    setCurrentIndex((current) => {
      if (!slides.length) return 0;
      return (current + direction + slides.length) % slides.length;
    });
  }

  return (
    <section className={styles.heroSection}>
      <aside className={styles.systems}>
        <h2>Sistemas</h2>
        <div className={styles.systemCards}>
          {systems.map((system) => (
            <button
              className={styles.systemCard}
              type="button"
              key={system.label}
              aria-label={system.label}
              onClick={() => {
                if (system.path) navigate(system.path);
              }}
            >
              <img src={system.image} alt="" aria-hidden="true" />
            </button>
          ))}
        </div>
      </aside>

      <div className={styles.bannerWrap}>
        <section
          className={styles.banner}
          aria-label="Destaques do portal Polis One"
          onClick={() => {
            if (activeSlide?.linkUrl) {
              window.open(activeSlide.linkUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          {activeSlide?.imagePath ? (
            <ProtectedStorageImage
              storagePath={activeSlide.imagePath}
              alt={activeSlide.title || "Banner da Home"}
            />
          ) : (
            <img src={bannerImage} alt="" aria-hidden="true" />
          )}

          {showCarouselControls ? (
            <>
              <button
                className={`${styles.bannerArrow} ${styles.bannerArrowLeft}`}
                type="button"
                aria-label="Banner anterior"
                onClick={(event) => {
                  event.stopPropagation();
                  stepSlide(-1);
                }}
              >
                ‹
              </button>
              <button
                className={`${styles.bannerArrow} ${styles.bannerArrowRight}`}
                type="button"
                aria-label="Próximo banner"
                onClick={(event) => {
                  event.stopPropagation();
                  stepSlide(1);
                }}
              >
                ›
              </button>
            </>
          ) : null}
        </section>

        <div className={styles.dots} aria-label="Navegação do carrossel">
          {slides.map((slide, index) => (
            <button
              key={slide.id ?? `banner-${index}`}
              type="button"
              className={`${styles.dotButton} ${index === currentIndex ? styles.dotActive : ""}`}
              aria-label={`Ir para banner ${index + 1}`}
              aria-pressed={index === currentIndex}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeHeroSection;
