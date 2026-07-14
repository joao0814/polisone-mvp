import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ConsultarChamado.module.css";
import { useUI } from "../../../context/UIContext";
import { useAuth } from "../../../context/AuthContext";
import { authApi } from "../../../services/api";
import ButtonOrange from "../../../components/Common/ButtonOrange/ButtonOrange";
import Modal from "../../../components/Common/Modal/Modal";
import FilePreviewModal from "../../../components/Common/FilePreviewModal/FilePreviewModal";
import MessageComposer from "./MessageComposer";
import {
  FaUser,
  FaCloudUploadAlt,
  FaDownload,
  FaFileImage,
  FaChevronDown,
  FaCheck,
} from "react-icons/fa";
import {
  getClassificationFieldLabel,
  getClassificationLabel,
  getDepartmentLabel,
} from "../ticketOptions";

const STATUS_CONFIG = {
  aberto: { label: "Aberto", color: "#f84d24" },
  em_analise: { label: "Em análise", color: "#1976d2" },
  em_andamento: { label: "Em andamento", color: "#0a2351" },
  aguardando_retorno: { label: "Aguardando retorno", color: "#e6a117" },
  aguardando_publicacao: { label: "Aguardando publicação", color: "#8e44ad" },
  aguardando_validacao: { label: "Aguardando validação", color: "#c48a00" },
  concluido: { label: "Concluído", color: "#2e7d32" },
};

const STATUS_ALIASES = {
  open: "aberto",
  closed: "concluido",
  complete: "concluido",
  completed: "concluido",
};

const PRIORITY_LABELS = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const ROLE_LABELS = {
  admin: "Administrador",
  desenvolvedor: "Desenvolvedor",
  franchise: "Franquia",
  manager: "Gerente",
  consultant: "Consultor",
  company: "Empresa",
  customer: "Cliente",
};

const getRoleLabel = (role) =>
  ROLE_LABELS[role] || (role ? role.charAt(0).toUpperCase() + role.slice(1) : "Não informado");

const normalizeStatus = (status) => STATUS_ALIASES[status] || status;

const getPriorityLabel = (priority) => {
  if (!priority) return "Não informada";
  return PRIORITY_LABELS[priority] || priority.charAt(0).toUpperCase() + priority.slice(1);
};

export default function ConsultarChamado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoading, hideLoading, addToast } = useUI();
  const { auth } = useAuth();

  const [chamado, setChamado] = useState(null);
  const [messages, setMessages] = useState([]);
  const [senderPhotos, setSenderPhotos] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);
  const [closeMessage, setCloseMessage] = useState("");
  const [closeAttachments, setCloseAttachments] = useState([]);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopeningTicket, setReopeningTicket] = useState(false);
  const [reopenMessage, setReopenMessage] = useState("");
  const [reopenAttachments, setReopenAttachments] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const senderPhotoCacheRef = useRef(new Map());

  const loadChamado = useCallback(async () => {
    showLoading();
    try {
      const res = await authApi.get(`/v1/support-tickets/${id}`);
      const data = res.data?.data ?? res.data;
      setChamado(data);
      setMessages(data?.messages ?? []);
    } catch (err) {
      console.error("Erro ao buscar chamado:", err);
      addToast({
        message: err.response?.data?.message || "Erro ao carregar chamado.",
        type: "error",
        duration: 4000,
      });
    } finally {
      hideLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Busca dados do chamado
  useEffect(() => {
    if (id) loadChamado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Toda foto de mensagem segue a mesma regra: sender_id -> sender_photo.
  // Os dados do solicitante e do usuário logado cobrem respostas antigas e
  // mensagens recém-enviadas que ainda não tenham o perfil enriquecido.
  useEffect(() => {
    let active = true;
    const photoSources = new Map();
    const addPhotoSource = (senderId, photoPath) => {
      if (senderId != null && photoPath) {
        photoSources.set(String(senderId), photoPath);
      }
    };

    addPhotoSource(
      chamado?.requester?.id ?? chamado?.user_id,
      chamado?.requester?.photo,
    );
    addPhotoSource(auth?.user?.id, auth?.user?.photo);
    messages.forEach((message) => {
      addPhotoSource(message.sender_id, message.sender_photo);
    });

    const loadSenderPhotos = async () => {
      const resolvedPhotos = {};
      const createdEntries = [];

      await Promise.all(
        Array.from(photoSources, async ([senderId, photoPath]) => {
          const cached = senderPhotoCacheRef.current.get(senderId);
          if (cached?.path === photoPath) {
            resolvedPhotos[senderId] = cached.url;
            return;
          }

          if (cached) {
            URL.revokeObjectURL(cached.url);
            senderPhotoCacheRef.current.delete(senderId);
          }

          try {
            const response = await authApi.get(`/v1/storage/${photoPath}`, {
              responseType: "blob",
            });
            const url = URL.createObjectURL(response.data);
            createdEntries.push({ senderId, path: photoPath, url });
            resolvedPhotos[senderId] = url;
          } catch {
            // O avatar genérico continua sendo o fallback visual.
          }
        }),
      );

      if (!active) {
        createdEntries.forEach(({ url }) => URL.revokeObjectURL(url));
        return;
      }

      createdEntries.forEach(({ senderId, path, url }) => {
        senderPhotoCacheRef.current.set(senderId, { path, url });
      });
      setSenderPhotos(resolvedPhotos);
    };

    loadSenderPhotos();
    return () => {
      active = false;
    };
  }, [
    messages,
    chamado?.requester?.id,
    chamado?.requester?.photo,
    chamado?.user_id,
    auth?.user?.id,
    auth?.user?.photo,
  ]);

  useEffect(
    () => () => {
      senderPhotoCacheRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
      senderPhotoCacheRef.current.clear();
    },
    [],
  );

  const messagesListRef = useRef(null);

  // Mantém a última mensagem encostada no limite inferior do próprio chat,
  // sem provocar rolagem na página inteira.
  useLayoutEffect(() => {
    const list = messagesListRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages]);

  const handleImagesPasted = (count) => {
    addToast({
      message: `${count} imagem(ns) anexada(s).`,
      type: "success",
      duration: 2000,
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    showLoading();
    try {
      const formData = new FormData();
      formData.append("message", newMessage);
      attachments.forEach((file) => {
        formData.append("files", file);
      });

      const res = await authApi.post(`/v1/support-tickets/${id}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newMsg = res.data?.data ?? res.data;
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      setAttachments([]);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      addToast({
        message: err.response?.data?.message || "Erro ao enviar mensagem.",
        type: "error",
        duration: 4000,
      });
    } finally {
      hideLoading();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseTicket = async () => {
    if (!closeMessage.trim()) return;

    setClosingTicket(true);
    try {
      const formData = new FormData();
      formData.append("message", closeMessage);
      closeAttachments.forEach((file) => formData.append("files", file));

      await authApi.put(`/v1/support-tickets/${id}/close`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadChamado();
      setCloseMessage("");
      setCloseAttachments([]);
      setCloseModalOpen(false);
      addToast({
        message: "Chamado encerrado com sucesso.",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      addToast({
        message:
          error.response?.data?.message || "Não foi possível encerrar o chamado.",
        type: "error",
        duration: 4000,
      });
    } finally {
      setClosingTicket(false);
    }
  };

  const handleReopenTicket = async () => {
    if (!reopenMessage.trim()) return;

    setReopeningTicket(true);
    try {
      const formData = new FormData();
      formData.append("message", reopenMessage);
      reopenAttachments.forEach((file) => formData.append("files", file));

      await authApi.put(`/v1/support-tickets/${id}/reopen`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadChamado();
      setReopenMessage("");
      setReopenAttachments([]);
      setReopenModalOpen(false);
      addToast({
        message: "Chamado reaberto com sucesso.",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      addToast({
        message:
          error.response?.data?.message || "Não foi possível reabrir o chamado.",
        type: "error",
        duration: 4000,
      });
    } finally {
      setReopeningTicket(false);
    }
  };

  const formatMessageDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAtendente = auth?.user?.role === "desenvolvedor";
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Sincroniza selectedStatus quando chamado carrega
  useEffect(() => {
    if (chamado?.status) setSelectedStatus(chamado.status);
  }, [chamado?.status]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClick = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSaveStatus = async () => {
    if (!selectedStatus || selectedStatus === chamado?.status) return;
    showLoading();
    try {
      await authApi.put(`/v1/support-tickets/${id}`, { status: selectedStatus });
      setChamado((prev) => ({ ...prev, status: selectedStatus }));
      addToast({ message: "Status atualizado com sucesso!", type: "success", duration: 3000 });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      addToast({
        message: err.response?.data?.message || "Erro ao atualizar status.",
        type: "error",
        duration: 4000,
      });
    } finally {
      hideLoading();
    }
  };

  const normalizedStatus = normalizeStatus(chamado?.status);
  const statusConfig = STATUS_CONFIG[normalizedStatus] || { label: chamado?.status, color: "#999" };
  const requester = chamado
    ? {
        id: chamado.requester?.id ?? chamado.user_id,
        name: chamado.requester?.name || chamado.user_name || "Usuário",
        email: chamado.requester?.email || null,
        role: chamado.requester?.role || null,
        lifeId: chamado.requester?.life_id || null,
        companies: chamado.requester?.companies || [],
      }
    : null;
  const isTicketOwner =
    auth?.user?.id != null &&
    requester?.id != null &&
    String(auth.user.id) === String(requester.id);
  const isTicketClosed = normalizedStatus === "concluido";
  const canManageTicketClosure = isTicketOwner || isAtendente;
  const canCloseTicket =
    Boolean(chamado) &&
    !isTicketClosed &&
    canManageTicketClosure;
  const canReopenTicket =
    Boolean(chamado) && isTicketClosed && canManageTicketClosure;
  const orderedMessages = [...messages].sort((first, second) => {
    const firstDate = new Date(first.created_at ?? first.createdAt ?? 0).getTime();
    const secondDate = new Date(second.created_at ?? second.createdAt ?? 0).getTime();
    return firstDate - secondDate;
  });
  return (
    <div className={styles.portalContent}>
          <div className={styles.contentCard}>
            {/* Cabeçalho do chamado */}
            <div className={styles.ticketHeader}>
              <div className={styles.ticketInfo}>
                <h1 className={styles.pageTitle}>
                  Chamado #{chamado?.protocol || id}
                </h1>
                {chamado && (
                  isAtendente ? (
                    <div className={styles.statusControl}>
                      <div className={styles.statusDropdownWrapper} ref={statusDropdownRef}>
                        <button
                          className={styles.statusDropdownTrigger}
                          style={{ borderColor: (STATUS_CONFIG[selectedStatus] || statusConfig).color }}
                          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                        >
                          <span
                            className={styles.statusDot}
                            style={{ backgroundColor: (STATUS_CONFIG[selectedStatus] || statusConfig).color }}
                          />
                          <span style={{ color: (STATUS_CONFIG[selectedStatus] || statusConfig).color }}>
                            {(STATUS_CONFIG[selectedStatus] || statusConfig).label}
                          </span>
                          <FaChevronDown className={`${styles.statusChevron} ${statusDropdownOpen ? styles.statusChevronOpen : ""}`} />
                        </button>
                        {statusDropdownOpen && (
                          <div className={styles.statusDropdownMenu}>
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                              <button
                                key={key}
                                className={`${styles.statusDropdownItem} ${selectedStatus === key ? styles.statusDropdownItemActive : ""}`}
                                onClick={() => { setSelectedStatus(key); setStatusDropdownOpen(false); }}
                              >
                                <span className={styles.statusDot} style={{ backgroundColor: cfg.color }} />
                                <span>{cfg.label}</span>
                                {selectedStatus === key && <FaCheck className={styles.statusCheckIcon} />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedStatus && selectedStatus !== chamado.status && (
                        <button className={styles.statusSaveBtn} onClick={handleSaveStatus}>
                          Salvar
                        </button>
                      )}
                    </div>
                  ) : (
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                  )
                )}
              </div>
              <div className={styles.ticketActions}>
                {canCloseTicket && (
                  <button
                    className={styles.closeTicketBtn}
                    onClick={() => setCloseModalOpen(true)}
                    type="button"
                  >
                    Encerrar chamado
                  </button>
                )}
                {canReopenTicket && (
                  <button
                    className={styles.closeTicketBtn}
                    onClick={() => setReopenModalOpen(true)}
                    type="button"
                    disabled={reopeningTicket}
                  >
                    {reopeningTicket ? "Reabrindo..." : "Reabrir chamado"}
                  </button>
                )}
                <ButtonOrange
                  label="Voltar"
                  onClick={() => navigate("/chamados")}
                />
              </div>
            </div>

            {chamado && (
              <div className={styles.ticketMeta}>
                <span><strong>Assunto:</strong> {chamado.subject}</span>
                <span><strong>Departamento:</strong> {getDepartmentLabel(chamado.department)}</span>
                {chamado.subcategory && (
                  <span>
                    <strong>{getClassificationFieldLabel(chamado.department)}:</strong>{" "}
                    {getClassificationLabel(chamado.department, chamado.subcategory)}
                  </span>
                )}
                <span><strong>Prioridade:</strong> {getPriorityLabel(chamado.priority)}</span>
                <span><strong>Aberto em:</strong> {formatMessageDate(chamado.created_at)}</span>
              </div>
            )}

            {/* Chat */}
            <div className={styles.chatContainer}>
              <div
                className={styles.messagesList}
                ref={messagesListRef}
                role="log"
                aria-label="Histórico de mensagens"
                aria-live="polite"
                aria-relevant="additions"
              >
                {orderedMessages.map((msg, index) => {
                  const isStaff = msg.sender_type === "staff" || msg.sender_type === "admin";
                  const isRequester = !isStaff && (
                    msg.sender_id === requester?.id || msg.sender_type === "user"
                  );
                  const messagePhoto = senderPhotos[String(msg.sender_id)] ?? null;
                  const subtitlePerson = isRequester
                    ? requester
                    : isStaff
                      ? {
                          role: msg.sender_role ?? null,
                          email: msg.sender_email ?? null,
                          companies: msg.sender_companies || [],
                        }
                      : null;
                  return (
                    <div
                      key={msg.id || index}
                      className={`${styles.messageItem} ${isStaff ? styles.messageStaff : styles.messageUser}`}
                    >
                      <div className={styles.messageAvatar}>
                        {messagePhoto ? (
                          <img
                            src={messagePhoto}
                            alt={isRequester ? requester.name : msg.sender_name}
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className={styles.messageBubble}>
                        <div className={styles.messageHeader}>
                          <div className={styles.senderInfo}>
                            <span className={styles.senderName}>{msg.sender_name || "Usuário"}</span>
                            {isStaff && (
                              <span className={styles.senderBadge}>ATENDENTE</span>
                            )}
                          </div>
                          <span className={styles.messageDate}>
                            {formatMessageDate(msg.created_at)}
                          </span>
                        </div>
                        {subtitlePerson && (
                          <div
                            className={styles.requesterSubtitle}
                            role="group"
                            aria-label="Dados do remetente"
                          >
                            <span className={styles.requesterRole}>
                              {getRoleLabel(subtitlePerson.role)}
                            </span>
                            {subtitlePerson.email && (
                              <span>{subtitlePerson.email}</span>
                            )}
                            <span>
                              {subtitlePerson.companies.length > 0
                                ? subtitlePerson.companies
                                    .map((company) => company.name)
                                    .join(", ")
                                : "Sem empresa vinculada via Life"}
                            </span>
                          </div>
                        )}
                        <div className={styles.messageBody}>
                          {msg.message?.split("\n").map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={styles.messageAttachments}>
                            {msg.attachments.map((file, fi) => (
                              <button
                                key={fi}
                                className={styles.attachmentItem}
                                onClick={() =>
                                  setPreviewFile({ path: file.path, name: file.name })
                                }
                              >
                                <FaFileImage className={styles.attachmentIcon} />
                                <span className={styles.attachmentName}>{file.name}</span>
                                <FaDownload className={styles.attachmentDownload} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Área de resposta */}
              <div className={styles.replyArea}>
                <MessageComposer
                  value={newMessage}
                  onChange={setNewMessage}
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                  placeholder={
                    isTicketClosed
                      ? "Envio de mensagens bloqueado"
                      : "Responder... (dica: cole imagens com Ctrl+V)"
                  }
                  disabled={isTicketClosed}
                  onKeyDown={handleKeyDown}
                  onImagesPasted={handleImagesPasted}
                  hint={
                    isTicketClosed ? (
                      <span className={styles.closedReplyHint}>
                        Chamado encerrado. Reabra o chamado para enviar novas mensagens.
                      </span>
                    ) : null
                  }
                />
                <button
                  className={styles.sendBtn}
                  onClick={handleSendMessage}
                  disabled={
                    isTicketClosed ||
                    (!newMessage.trim() && attachments.length === 0)
                  }
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
          <Modal
            isOpen={closeModalOpen}
            onClose={() => {
              if (closingTicket) return;
              setCloseModalOpen(false);
              setCloseMessage("");
              setCloseAttachments([]);
            }}
            variant="dialog"
          >
            <div className={styles.closeTicketModal}>
              <h2>Encerrar chamado?</h2>
              <p>
                Use esta opção se o chamado foi aberto por engano, está duplicado
                ou não precisa mais de atendimento.
              </p>
              <p className={styles.closeTicketWarning}>
                Não será possível enviar novas mensagens enquanto ele estiver encerrado.
              </p>
              <label className={styles.modalFieldLabel}>
                Motivo do encerramento
              </label>
              <div className={styles.modalReplyArea}>
                <MessageComposer
                  value={closeMessage}
                  onChange={setCloseMessage}
                  attachments={closeAttachments}
                  onAttachmentsChange={setCloseAttachments}
                  placeholder="Descreva o motivo do encerramento..."
                  disabled={closingTicket}
                />
              </div>
              <div className={styles.closeTicketModalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setCloseModalOpen(false);
                    setCloseMessage("");
                    setCloseAttachments([]);
                  }}
                  disabled={closingTicket}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCloseTicket}
                  disabled={closingTicket || !closeMessage.trim()}
                >
                  {closingTicket ? "Encerrando..." : "Confirmar encerramento"}
                </button>
              </div>
            </div>
          </Modal>
          <Modal
            isOpen={reopenModalOpen}
            onClose={() => {
              if (reopeningTicket) return;
              setReopenModalOpen(false);
              setReopenMessage("");
              setReopenAttachments([]);
            }}
            variant="dialog"
          >
            <div className={styles.closeTicketModal}>
              <h2>Reabrir chamado?</h2>
              <p>
                O status voltará para <strong>Aberto</strong> e o envio de novas
                mensagens será liberado novamente.
              </p>
              <label className={styles.modalFieldLabel}>
                Motivo da reabertura
              </label>
              <div className={styles.modalReplyArea}>
                <MessageComposer
                  value={reopenMessage}
                  onChange={setReopenMessage}
                  attachments={reopenAttachments}
                  onAttachmentsChange={setReopenAttachments}
                  placeholder="Descreva o motivo da reabertura..."
                  disabled={reopeningTicket}
                />
              </div>
              <div className={styles.closeTicketModalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setReopenModalOpen(false);
                    setReopenMessage("");
                    setReopenAttachments([]);
                  }}
                  disabled={reopeningTicket}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleReopenTicket}
                  disabled={reopeningTicket || !reopenMessage.trim()}
                >
                  {reopeningTicket ? "Reabrindo..." : "Confirmar reabertura"}
                </button>
              </div>
            </div>
          </Modal>
          <FilePreviewModal
            isOpen={Boolean(previewFile)}
            storageKey={previewFile?.path}
            fileName={previewFile?.name}
            onClose={() => setPreviewFile(null)}
          />
    </div>
  );
}
