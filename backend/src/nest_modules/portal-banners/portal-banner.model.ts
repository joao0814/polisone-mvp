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

@Table({
  tableName: 'portal_banners',
  timestamps: true,
  underscored: true,
})
export class PortalBannerModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(180))
  declare title: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(500), field: 'link_url' })
  declare linkUrl: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(500), field: 'image_path' })
  declare imagePath: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'image_name' })
  declare imageName: string;

  @AllowNull(false)
  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_active' })
  declare isActive: boolean;

  @CreatedAt declare createdAt: Date;
  @UpdatedAt declare updatedAt: Date;
}
