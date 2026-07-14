import { useEffect, useRef } from "react";
import { FaFile, FaPaperclip } from "react-icons/fa";
import styles from "./ConsultarChamado.module.css";

export default function MessageComposer({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  placeholder,
  disabled,
  onKeyDown,
  hint,
  onImagesPasted,
}) {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // A textarea cresce conforme o conteúdo, em vez de exibir scrollbar.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    onAttachmentsChange([...attachments, ...files]);
    e.target.value = "";
  };

  const handlePasteImage = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const pastedFiles = [];
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const ext = file.type.split("/")[1] || "png";
          const renamed = new File([file], `print-${timestamp}.${ext}`, {
            type: file.type,
          });
          pastedFiles.push(renamed);
        }
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      onAttachmentsChange([...attachments, ...pastedFiles]);
      onImagesPasted?.(pastedFiles.length);
    }
  };

  const removeAttachment = (index) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className={styles.replyActions}>
        <button
          type="button"
          className={styles.replyIconBtn}
          title="Anexar arquivo"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <FaPaperclip />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
          onChange={handleFileSelect}
          disabled={disabled}
          style={{ display: "none" }}
        />
      </div>
      <div className={styles.replyInputArea}>
        {hint}
        {attachments.length > 0 && (
          <div className={styles.replyAttachments}>
            {attachments.map((file, index) => (
              <span key={index} className={styles.replyAttachmentTag}>
                <FaFile />
                {file.name}
                <button type="button" onClick={() => removeAttachment(index)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          className={styles.replyInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={handlePasteImage}
          disabled={disabled}
          rows={1}
        />
      </div>
    </>
  );
}
