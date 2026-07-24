import { useEffect, useMemo, useState } from "react";
import logoNav from "../../assets/images/home/logo nav.png";
import AsyncSectionState from "../../components/Common/AsyncSectionState/AsyncSectionState";
import ProtectedStorageImage from "../../components/Common/ProtectedStorageImage/ProtectedStorageImage";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import { getProfile, updateProfile } from "../../services/profile";
import styles from "./MeusDados.module.css";

const PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

const menuItems = [
  { label: "Portal do Candidato", path: "/" },
  { label: "Visao Geral", path: "/gestao-campanha" },
  { label: "Inteligencia Eleitoral", path: "/inteligencia-eleitoral" },
  { label: "Municipios", path: "/municipios" },
  { label: "Emendas", path: "/emendas" },
  { label: "Equipes", path: "/equipes" },
  { label: "Check-in", path: "/check-in" },
  { label: "Pesquisa de campo", path: "/pesquisa-campo" },
  { label: "Territorio" },
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
  const sessionRoles = useMemo(() => getRoles(session?.user), [session?.user]);
  const roleLabel = useMemo(() => getRoleLabel(sessionRoles), [sessionRoles]);
  const isCandidateProfile = useMemo(
    () =>
      !sessionRoles.length ||
      sessionRoles.some((role) =>
        ["CANDIDATO", "CANDIDATE", "ADMIN", "MANAGER"].includes(role),
      ),
    [sessionRoles],
  );

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
    const nextValue = event.target.value;

    setForm((current) => ({
      ...current,
      [field]:
        field === "electionYear"
          ? nextValue.replace(/\D/g, "").slice(0, 4)
          : field === "voteGoal"
            ? nextValue.replace(/\D/g, "")
            : field === "party"
              ? nextValue.toUpperCase()
              : nextValue,
    }));
    setMessage("");
    setError("");
  };

  function selectPhoto(event) {
    const file = event.target.files?.[0] || null;

    if (file && !PROFILE_IMAGE_TYPES.has(file.type)) {
      setError("Selecione uma imagem JPG, PNG ou WEBP.");
      setMessage("");
      event.target.value = "";
      return;
    }

    if (file && file.size > PROFILE_IMAGE_MAX_SIZE) {
      setError("A foto deve ter no maximo 5 MB.");
      setMessage("");
      event.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhoto(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
    setMessage("");
    setError("");
  }

  async function submit(event) {
    event.preventDefault();

    const validationError = validateProfileForm(form, { isCandidateProfile });
    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "email") return;
      if (!isCandidateProfile && isCampaignField(key)) return;
      if (value !== "") payload.append(key, normalizeFieldValue(key, value));
    });

    if (photo) payload.append("photo", photo);

    try {
      const result = await updateProfile(payload);
      setProfileImagePath(result.user.profile_image_path || "");
      setPhoto(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      onUserUpdate?.(result.user);
      setMessage("Seus dados foram atualizados com sucesso.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Meus dados"
        brandImage={logoNav}
        brandLabel="Campanha"
        items={menuItems}
        onLogout={onLogout}
        profileImagePath={profileImagePath}
        roleLabel={roleLabel}
        userName={form.name || session?.user?.name}
      />

      <section className={styles.workspace}>
        {loading ? (
          <AsyncSectionState
            state="loading"
            title="Carregando seus dados"
            description="Estamos preparando o perfil e as configuracoes da campanha."
          />
        ) : error && !form.email ? (
          <AsyncSectionState
            state="error"
            title="Não foi possivel carregar seus dados"
            description={error}
          />
        ) : (
          <>
        <header className={styles.header}>
          <div>
            <p>Perfil e configuracoes</p>
            <h1>Meus dados</h1>
            <span>
              Mantenha seus dados pessoais e as informacoes da campanha atualizados.
            </span>
          </div>

          <div className={styles.statusPill}>{roleLabel}</div>
        </header>

        <form className={styles.form} onSubmit={submit}>
          <section className={styles.card}>
            <CardHeading
              number="01"
              title="Dados pessoais"
              description="Informacoes usadas para identificar sua conta no Polis One."
            />

            <div className={styles.profileGrid}>
              <div className={styles.photoColumn}>
                <div className={styles.photoFrame}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Previa da foto de perfil" />
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
                <small>JPG, PNG ou WEBP. Maximo de 5 MB.</small>
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
              description="Esses dados contextualizam equipes, municipios, metas e indicadores."
            />

            {!isCandidateProfile ? (
              <p className={styles.info}>
                Seu perfil pode atualizar os dados pessoais, mas os dados da campanha
                ficam em modo somente leitura.
              </p>
            ) : null}

            <div className={styles.campaignGrid}>
              <Field label="Nome da campanha" wide>
                <input
                  value={form.campaignName}
                  onChange={change("campaignName")}
                  maxLength={180}
                  placeholder="Ex.: Campanha Alan Leal 2026"
                  disabled={!isCandidateProfile}
                  required={isCandidateProfile}
                />
              </Field>

              <Field label="Nome do candidato">
                <input
                  value={form.candidateName}
                  onChange={change("candidateName")}
                  maxLength={180}
                  disabled={!isCandidateProfile}
                  required={isCandidateProfile}
                />
              </Field>

              <Field label="Ano da eleição">
                <input
                  value={form.electionYear}
                  onChange={change("electionYear")}
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  disabled={!isCandidateProfile}
                  required={isCandidateProfile}
                />
              </Field>

              <Field label="Cargo pretendido">
                <select
                  value={form.intendedOffice}
                  onChange={change("intendedOffice")}
                  disabled={!isCandidateProfile}
                  required={isCandidateProfile}
                >
                  <option value="">Selecione</option>
                  {offices.map((office) => (
                    <option key={office}>{office}</option>
                  ))}
                </select>
              </Field>

              <Field label="UF">
                <select
                  value={form.state}
                  onChange={change("state")}
                  disabled={!isCandidateProfile}
                  required={isCandidateProfile}
                >
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
                  disabled={!isCandidateProfile}
                />
              </Field>

              <Field label="Situacao">
                <select
                  value={form.campaignStatus}
                  onChange={change("campaignStatus")}
                  disabled={!isCandidateProfile}
                >
                  <option value="PRE_CAMPAIGN">Pre-campanha</option>
                  <option value="ACTIVE">Ativa</option>
                  <option value="PAUSED">Pausada</option>
                  <option value="FINISHED">Finalizada</option>
                </select>
              </Field>

              <Field label="Inicio da campanha">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={change("startDate")}
                  disabled={!isCandidateProfile}
                />
              </Field>

              <Field label="Data da eleição">
                <input
                  type="date"
                  value={form.electionDate}
                  onChange={change("electionDate")}
                  disabled={!isCandidateProfile}
                />
              </Field>

              <Field label="Meta de votos">
                <input
                  type="number"
                  min="0"
                  value={form.voteGoal}
                  onChange={change("voteGoal")}
                  placeholder="120000"
                  disabled={!isCandidateProfile}
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
              {saving ? "Salvando..." : "Salvar alteracoes"}
            </button>
          </footer>
        </form>
          </>
        )}
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

function getRoles(user) {
  if (Array.isArray(user?.roles)) {
    return user.roles.map((role) => String(role).toUpperCase());
  }

  if (user?.role) {
    return [String(user.role).toUpperCase()];
  }

  return [];
}

function getRoleLabel(roles) {
  if (roles.includes("ADMIN")) return "Administrador";
  if (roles.includes("MANAGER")) return "Gestor";
  if (roles.includes("LIDERANCA")) return "Liderança";
  if (roles.includes("REPRESENTANTE")) return "Representante";
  if (roles.includes("EQUIPE")) return "Equipe";
  return "Candidato";
}

function isCampaignField(field) {
  return [
    "campaignName",
    "candidateName",
    "electionYear",
    "state",
    "intendedOffice",
    "party",
    "campaignStatus",
    "startDate",
    "electionDate",
    "voteGoal",
  ].includes(field);
}

function normalizeFieldValue(field, value) {
  if (field === "party") {
    return String(value).trim().toUpperCase();
  }

  if (field === "voteGoal") {
    return String(value).replace(/\D/g, "");
  }

  if (field === "electionYear") {
    return String(value).replace(/\D/g, "").slice(0, 4);
  }

  return typeof value === "string" ? value.trim() : value;
}

function validateProfileForm(form, { isCandidateProfile }) {
  if (!form.name.trim()) {
    return "Informe o nome completo.";
  }

  if (!isCandidateProfile) {
    return "";
  }

  if (!form.campaignName.trim()) {
    return "Informe o nome da campanha.";
  }

  if (!form.candidateName.trim()) {
    return "Informe o nome do candidato.";
  }

  if (!/^\d{4}$/.test(String(form.electionYear || "").trim())) {
    return "Informe um ano de eleição valido com 4 digitos.";
  }

  if (!form.intendedOffice) {
    return "Selecione o cargo pretendido.";
  }

  if (form.startDate && form.electionDate && form.startDate > form.electionDate) {
    return "A data de início da campanha não pode ser maior que a data da eleição.";
  }

  if (form.voteGoal !== "") {
    const goal = Number(form.voteGoal);
    if (!Number.isInteger(goal) || goal < 0) {
      return "Informe uma meta de votos valida.";
    }
  }

  return "";
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || "U"}${parts.at(-1)?.[0] || parts[0]?.[1] || ""}`.toUpperCase();
}

export default MeusDados;
