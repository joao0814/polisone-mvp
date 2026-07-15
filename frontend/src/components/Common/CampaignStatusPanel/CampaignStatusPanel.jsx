import { useEffect, useMemo, useState } from "react";
import styles from "./CampaignStatusPanel.module.css";

const DEFAULT_ITEMS = [
  {
    id: "campaign-start",
    label: "Dias para o inicio da campanha.",
    targetDate: "2026-08-16T00:00:00-03:00",
    startDate: "2026-07-01T00:00:00-03:00",
  },
  {
    id: "election-day",
    label: "Dias para o dia da eleicao.",
    targetDate: "2026-10-04T00:00:00-03:00",
    startDate: "2026-07-01T00:00:00-03:00",
    footerSuffix: "(primeiro turno)",
  },
];

function CampaignStatusPanel({
  className = "",
  items = DEFAULT_ITEMS,
  mode = "page",
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const resolvedItems = useMemo(
    () => items.map((item) => buildCountdownItem(item, now)),
    [items, now],
  );

  const dateTime = useMemo(() => {
    const dateLabel = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(now);

    const timeLabel = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);

    return {
      iso: now.toISOString(),
      dateLabel,
      timeLabel,
    };
  }, [now]);

  return (
    <div className={`${styles.root} ${styles[mode]} ${className}`.trim()}>
      <div className={styles.stack} aria-label="Contagem regressiva">
        {resolvedItems.map((item) =>
          mode === "dashboard" ? (
            <article className={styles.dashboardCard} key={item.id}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <i style={{ "--value": `${item.progress}%` }} />
            </article>
          ) : (
            <article className={styles.card} key={item.id}>
              <span className={styles.cardTitle}>Contagem regressiva</span>
              <div className={styles.cardBody}>
                <strong>{item.value}</strong>
                <p>{item.label}</p>
                <i style={{ "--value": `${item.progress}%` }} />
              </div>
              <small>{item.footer}</small>
            </article>
          ),
        )}
      </div>

      <time className={styles.dateBox} dateTime={dateTime.iso}>
        <strong>{dateTime.dateLabel}</strong>
        <span />
        <small>{dateTime.timeLabel}</small>
      </time>
    </div>
  );
}

function buildCountdownItem(item, now) {
  const targetDate = new Date(item.targetDate);
  const startDate = item.startDate ? new Date(item.startDate) : null;
  const value = calculateRemainingDays(now, targetDate);
  const progress =
    startDate instanceof Date && !Number.isNaN(startDate.getTime())
      ? calculateProgress(now, startDate, targetDate)
      : Number(item.progress) || 0;

  return {
    ...item,
    value: String(value),
    progress,
    footer: buildFooterLabel(item, targetDate),
  };
}

function calculateRemainingDays(now, targetDate) {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfTarget = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  ).getTime();
  const diff = startOfTarget - startOfToday;

  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function calculateProgress(now, startDate, targetDate) {
  const total = targetDate.getTime() - startDate.getTime();

  if (total <= 0) return 0;

  const elapsed = now.getTime() - startDate.getTime();
  const value = (elapsed / total) * 100;

  return Math.min(100, Math.max(0, Math.round(value)));
}

function buildFooterLabel(item, targetDate) {
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(targetDate);

  return item.footerSuffix
    ? `${formattedDate} ${item.footerSuffix}`
    : formattedDate;
}

export default CampaignStatusPanel;
