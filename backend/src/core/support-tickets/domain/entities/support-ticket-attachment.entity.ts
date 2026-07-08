import { randomUUID } from 'crypto';

export type SupportTicketAttachmentProps = {
  id?: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  size: number;
  messageId?: string | null;
  createdAt?: Date;
};

export class SupportTicketAttachmentEntity {
  private constructor(
    private readonly props: Required<SupportTicketAttachmentProps>,
  ) {}

  static create(
    props: SupportTicketAttachmentProps,
  ): SupportTicketAttachmentEntity {
    const attachment = new SupportTicketAttachmentEntity({
      id: props.id ?? randomUUID(),
      fileName: props.fileName,
      storagePath: props.storagePath,
      mimeType: props.mimeType,
      size: props.size,
      messageId: props.messageId ?? null,
      createdAt: props.createdAt ?? new Date(),
    });

    attachment.validate();
    return attachment;
  }

  get id(): string {
    return this.props.id;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get storagePath(): string {
    return this.props.storagePath;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get size(): number {
    return this.props.size;
  }

  get messageId(): string | null {
    return this.props.messageId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  private validate(): void {
    if (!this.props.fileName.trim()) {
      throw new Error('Attachment file name is required');
    }

    if (!this.props.storagePath.trim()) {
      throw new Error('Attachment storage path is required');
    }

    if (!this.props.mimeType.trim()) {
      throw new Error('Attachment mime type is required');
    }

    if (this.props.size < 0) {
      throw new Error('Attachment size must be greater than or equal to zero');
    }
  }
}
