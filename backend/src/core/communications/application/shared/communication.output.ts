import { CommunicationEntity } from '../../domain/entities/communication.entity';
export class CommunicationOutputMapper {
  static toOutput(entity: CommunicationEntity) {
    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      description: entity.description,
      content: entity.content,
      status: entity.status,
      categoryId: entity.categoryId,
      authorId: entity.authorId,
      publishedAt: entity.publishedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
