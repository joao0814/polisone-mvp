import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { CommunicationStatus } from '../../../../domain/enums/communication-status.enum';

@Table({
  tableName: 'communication_categories',
  timestamps: true,
  underscored: true,
})
export class CommunicationCategoryModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;
  @AllowNull(false) @Column(DataType.STRING(100)) declare name: string;
  @AllowNull(false) @Column(DataType.STRING(120)) declare slug: string;
  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare active: boolean;
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({
  tableName: 'communications',
  timestamps: true,
  underscored: true,
  paranoid: true,
})
export class CommunicationModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;
  @AllowNull(false) @Column(DataType.STRING(180)) declare slug: string;
  @AllowNull(false) @Column(DataType.STRING(180)) declare title: string;
  @AllowNull(false) @Column(DataType.STRING(500)) declare description: string;
  @AllowNull(false) @Column(DataType.TEXT) declare content: string;
  @Column({ type: DataType.STRING(500), field: 'cover_image_path' })
  declare coverImagePath: string | null;
  @Column({ type: DataType.STRING(255), field: 'cover_image_name' })
  declare coverImageName: string | null;
  @AllowNull(false)
  @Default(CommunicationStatus.DRAFT)
  @Column(DataType.ENUM(...Object.values(CommunicationStatus)))
  declare status: CommunicationStatus;
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'category_id' })
  declare categoryId: string;
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'author_id' })
  declare authorId: string;
  @Column({ type: DataType.DATE, field: 'published_at' })
  declare publishedAt: Date | null;
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  declare deletedAt: Date | null;
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({ tableName: 'communication_tags', timestamps: true, underscored: true })
export class CommunicationTagModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;
  @AllowNull(false) @Column(DataType.STRING(80)) declare name: string;
  @AllowNull(false) @Column(DataType.STRING(100)) declare slug: string;
  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}

@Table({
  tableName: 'communication_tag_links',
  timestamps: false,
  underscored: true,
})
export class CommunicationTagLinkModel extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, field: 'communication_id' })
  declare communicationId: string;
  @PrimaryKey
  @Column({ type: DataType.UUID, field: 'tag_id' })
  declare tagId: string;
}

@Table({
  tableName: 'communication_views',
  timestamps: true,
  updatedAt: false,
  underscored: true,
})
export class CommunicationViewModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'communication_id' })
  declare communicationId: string;
  @Column({ type: DataType.UUID, field: 'user_id' }) declare userId:
    string | null;
  @Column({ type: DataType.STRING(128), field: 'session_key' })
  declare sessionKey: string | null;
  @CreatedAt declare createdAt: Date;
}

@Table({
  tableName: 'communication_audit_logs',
  timestamps: true,
  updatedAt: false,
  underscored: true,
})
export class CommunicationAuditLogModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'communication_id' })
  declare communicationId: string;
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'actor_id' })
  declare actorId: string;
  @AllowNull(false) @Column(DataType.STRING(40)) declare action: string;
  @Column(DataType.JSONB) declare changes: Record<string, unknown> | null;
  @CreatedAt declare createdAt: Date;
}
