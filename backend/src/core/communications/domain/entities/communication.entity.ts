import { CommunicationStatus } from '../enums/communication-status.enum';

export interface CommunicationProps {
  id?: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  status?: CommunicationStatus;
  categoryId: string;
  authorId: string;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CommunicationEntity {
  private constructor(private readonly props: CommunicationProps) {}
  static create(props: CommunicationProps) {
    const entity = new CommunicationEntity({
      ...props,
      title: props.title.trim(),
      description: props.description.trim(),
      content: props.content.trim(),
      status: props.status ?? CommunicationStatus.DRAFT,
    });
    entity.validate();
    return entity;
  }
  publish() {
    if (this.status !== CommunicationStatus.DRAFT)
      throw new Error('Only drafts can be published');
    this.props.status = CommunicationStatus.PUBLISHED;
    this.props.publishedAt = new Date();
  }
  archive() {
    if (this.status === CommunicationStatus.ARCHIVED)
      throw new Error('Communication is already archived');
    this.props.status = CommunicationStatus.ARCHIVED;
  }
  restore() {
    if (this.status !== CommunicationStatus.ARCHIVED)
      throw new Error('Only archived communications can be restored');
    this.props.status = CommunicationStatus.DRAFT;
  }
  private validate() {
    if (this.props.title.length < 3)
      throw new Error('Communication title is required');
    if (!this.props.description)
      throw new Error('Communication description is required');
    if (!this.props.content)
      throw new Error('Communication content is required');
    if (!this.props.categoryId || !this.props.authorId)
      throw new Error('Communication category and author are required');
  }
  get id() {
    return this.props.id;
  }
  get slug() {
    return this.props.slug;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get content() {
    return this.props.content;
  }
  get status() {
    return this.props.status!;
  }
  get categoryId() {
    return this.props.categoryId;
  }
  get authorId() {
    return this.props.authorId;
  }
  get publishedAt() {
    return this.props.publishedAt ?? null;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
