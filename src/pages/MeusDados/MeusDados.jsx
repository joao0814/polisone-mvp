import { useEffect, useMemo, useState } from "react";
import logoNav from "../../assets/images/home/logo nav.png";
import ProtectedStorageImage from "../../components/Common/ProtectedStorageImage/ProtectedStorageImage";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import { getProfile, updateProfile } from "../../services/profile";
import styles from "./MeusDados.module.css";

const menuItems = [
  { label: "Portal do Candidato", path: "/" },
  { label: "Visão Geral", path: "/gestao-campanha" },
  { label: "Inteligência Eleitoral", path: "/inteligencia-eleitoral" },
  { label: "Municípios", path: "/municipios" },
  { label: "Emendas", path: "/emendas" },
  { label: "Equipes", path: "/equipes" },
  { label: "Check-in", path: "/check-in" },
  { label: "Pesquisa de campo", path: "/pesquisa-campo" },
  { label: "Território" },
];
const initialForm = {
  name: "",
  email: "",
  campaignName: "",
  candidateName: "",
  electionYear: "2026",
  state: "SP",
  intendedOffice: "",
  party: "",
  campaignStatus: "PRE_CAMPAIGN",
  startDate: "",
  electionDate: "",
  voteGoal: "",
};
const offices = [
  "Presidente",
  "Governador",
  "Senador",
  "Deputado Federal",
  "Deputado Estadual",
  "Deputado Distrital",
  "Prefeito",
  "Vereador",
];
const states = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

function MeusDados({ session, onLogout, onUserUpdate }) {
  const [form, setForm] = useState(initialForm);
  const [profileImagePath, setProfileImagePath] = useState(
    session?.user?.profile_image_path || "",
  );
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProfile()
      .then((data) => {
        if (!active) return;
        const campaign = data.campaign;
        setProfileImagePath(data.user.profile_image_path || "");
        setForm({
          name: data.user.name || "",
          email: data.user.email || "",
          campaignName: campaign?.name || "",
          candidateName: campaign?.candidate_name || data.user.name || "",
          electionYear: campaign?.election_year
            ? String(campaign.election_year)
            : "2026",
          state: campaign?.state || "SP",
          intendedOffice: campaign?.intended_office || "",
          party: campaign?.party || "",
          campaignStatus: campaign?.status || "PRE_CAMPAIGN",
          startDate: campaign?.start_date || "",
          electionDate: campaign?.election_date || "",
          voteGoal:
            campaign?.vote_goal != null ? String(campaign.vote_goal) : "",
        });
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );
  const initials = useMemo(() => getInitials(form.name), [form.name]);
  const change = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setMessage("");
    setError("");
  };

  function selectPhoto(event) {
    const file = event.target.files?.[0] || null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhoto(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "email" && value !== "") payload.append(key, value);
    });
    if (photo) payload.append("photo", photo);
    try {
      const result = await updateProfile(payload);
      setProfileImagePath(result.user.profile_image_path || "");
      setPhoto(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      onUserUpdate?.(result.user);
      setMessage("Seus dados e a campanha foram atualizados com sucesso.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <main className={styles.loading}>Carregando seus dados...</main>;

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Meus dados"
        brandImage={logoNav}
        brandLabel="Campanha"
        items={menuItems}
        onLogout={onLogout}
        profileImagePath={profileImagePath}
        roleLabel="Candidato"
        userName={form.name || session?.user?.name}
      />
      <section className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <p>Perfil e configurações</p>
            <h1>Meus dados</h1>
            <span>
              Mantenha seus dados pessoais e as informações da campanha
              atualizados.
            </span>
          </div>
        </header>
        <form className={styles.form} onSubmit={submit}>
          <section className={styles.card}>
            <CardHeading
              number="01"
              title="Dados pessoais"
              description="Informações usadas para identificar sua conta no Polis One."
            />
            <div className={styles.profileGrid}>
              <div className={styles.photoColumn}>
                <div className={styles.photoFrame}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Prévia da foto de perfil" />
                  ) : (
                    <ProtectedStorageImage
                      storagePath={profileImagePath}
                      alt={`Foto de ${form.name}`}
                      fallback={<span>{initials}</span>}
                    />
                  )}
                </div>
                <label className={styles.photoButton}>
                  Alterar foto
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={selectPhoto}
                  />
                </label>
                <small>JPG, PNG ou WEBP. Máximo de 5 MB.</small>
              </div>
              <div className={styles.fieldsGrid}>
                <Field label="Nome completo">
                  <input
                    value={form.name}
                    onChange={change("name")}
                    maxLength={120}
                    required
                  />
                </Field>
                <Field label="E-mail">
                  <input value={form.email} type="email" disabled />
                </Field>
              </div>
            </div>
          </section>
          <section className={styles.card}>
            <CardHeading
              number="02"
              title="Dados da campanha"
              description="Esses dados contextualizam equipes, municípios, metas e indicadores."
            />
            <div className={styles.campaignGrid}>
              <Field label="Nome da campanha" wide>
                <input
                  value={form.campaignName}
                  onChange={change("campaignName")}
                  maxLength={180}
                  placeholder="Ex.: Campanha Alan Leal 2026"
                  required
                />
              </Field>
              <Field label="Nome do candidato">
                <input
                  value={form.candidateName}
                  onChange={change("candidateName")}
                  maxLength={180}
                  required
                />
              </Field>
              <Field label="Ano da eleição">
                <input
                  value={form.electionYear}
                  onChange={change("electionYear")}
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  required
                />
              </Field>
              <Field label="Cargo pretendido">
                <select
                  value={form.intendedOffice}
                  onChange={change("intendedOffice")}
                  required
                >
                  <option value="">Selecione</option>
                  {offices.map((office) => (
                    <option key={office}>{office}</option>
                  ))}
                </select>
              </Field>
              <Field label="UF">
                <select value={form.state} onChange={change("state")} required>
                  {states.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </Field>
              <Field label="Partido">
                <input
                  value={form.party}
                  onChange={change("party")}
                  maxLength={40}
                  placeholder="Ex.: PSD"
                />
              </Field>
              <Field label="Situação">
                <select
                  value={form.campaignStatus}
                  onChange={change("campaignStatus")}
                >
                  <option value="PRE_CAMPAIGN">Pré-campanha</option>
                  <option value="ACTIVE">Ativa</option>
                  <option value="PAUSED">Pausada</option>
                  <option value="FINISHED">Finalizada</option>
                </select>
              </Field>
              <Field label="Início da campanha">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={change("startDate")}
                />
              </Field>
              <Field label="Data da eleição">
                <input
                  type="date"
                  value={form.electionDate}
                  onChange={change("electionDate")}
                />
              </Field>
              <Field label="Meta de votos">
                <input
                  type="number"
                  min="0"
                  value={form.voteGoal}
                  onChange={change("voteGoal")}
                  placeholder="120000"
                />
              </Field>
            </div>
          </section>
          {message ? (
            <p className={styles.success} role="status">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <footer className={styles.actions}>
            <button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </footer>
        </form>
      </section>
    </main>
  );
}

function CardHeading({ number, title, description }) {
  return (
    <div className={styles.cardHeading}>
      <div>
        <span>{number}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
function Field({ label, wide = false, children }) {
  return (
    <label className={wide ? styles.wideField : styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || "U"}${parts.at(-1)?.[0] || parts[0]?.[1] || ""}`.toUpperCase();
}

export default MeusDados;
