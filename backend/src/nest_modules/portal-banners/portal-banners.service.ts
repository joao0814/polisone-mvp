import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PortalBannerModel } from './portal-banner.model';

type BannerPayload = {
  title: string;
  linkUrl?: string | null;
  imagePath: string;
  imageName: string;
};

@Injectable()
export class PortalBannersService {
  constructor(
    @InjectModel(PortalBannerModel)
    private readonly portalBanners: typeof PortalBannerModel,
  ) {}

  list() {
    return this.portalBanners.findAll({ order: [['createdAt', 'DESC']] });
  }

  listActive() {
    return this.portalBanners.findAll({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']],
    });
  }

  async getActive() {
    return this.portalBanners.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']],
    });
  }

  async create(payload: BannerPayload) {
    const hasActiveBanner = (await this.getActive()) != null;
    return this.portalBanners.create({
      title: payload.title.trim(),
      linkUrl: payload.linkUrl?.trim() || null,
      imagePath: payload.imagePath,
      imageName: payload.imageName,
      isActive: !hasActiveBanner,
    });
  }

  async update(id: string, payload: Partial<BannerPayload>) {
    const banner = await this.find(id);
    await banner.update({
      ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
      ...(payload.linkUrl !== undefined ? { linkUrl: payload.linkUrl?.trim() || null } : {}),
      ...(payload.imagePath !== undefined ? { imagePath: payload.imagePath } : {}),
      ...(payload.imageName !== undefined ? { imageName: payload.imageName } : {}),
    });
    return banner;
  }

  async setActiveState(id: string, isActive: boolean) {
    const banner = await this.find(id);
    await banner.update({ isActive });
    return banner;
  }

  async remove(id: string) {
    const banner = await this.find(id);
    await banner.destroy();
  }

  private async find(id: string) {
    const banner = await this.portalBanners.findByPk(id);
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }
}
