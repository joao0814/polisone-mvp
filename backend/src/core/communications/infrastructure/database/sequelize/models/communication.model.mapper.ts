import { CommunicationEntity } from '../../../../domain/entities/communication.entity';
import { CommunicationModel } from './communication.models';
export class CommunicationModelMapper {
  static toEntity(model: CommunicationModel) {
    return CommunicationEntity.create({
      id: model.id,
      slug: model.slug,
      title: model.title,
      description: model.description,
      content: model.content,
      coverImagePath: model.coverImagePath,
      coverImageName: model.coverImageName,
      status: model.status,
      categoryId: model.categoryId,
      authorId: model.authorId,
      publishedAt: model.publishedAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
  static toModel(entity: CommunicationEntity) {
    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      description: entity.description,
      content: entity.content,
      coverImagePath: entity.coverImagePath,
      coverImageName: entity.coverImageName,
      status: entity.status,
      categoryId: entity.categoryId,
      authorId: entity.authorId,
      publishedAt: entity.publishedAt,
    };
  }
}
