import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateCommunicationUseCase,
  DeleteCommunicationUseCase,
  GetCommunicationAuditUseCase,
  GetCommunicationMetricsUseCase,
  GetCommunicationUseCase,
  ListCommunicationCategoriesUseCase,
  ListCommunicationsUseCase,
  TransitionCommunicationUseCase,
  UpdateCommunicationUseCase,
} from '../../core/communications/application/use_case/communication.use-cases';
import { CommunicationStatus } from '../../core/communications/domain/enums/communication-status.enum';
import { UserRole } from '../../core/users/domain/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { communicationUseCaseTokens } from './communications.providers';
import {
  CreateCommunicationDto,
  ListCommunicationsDto,
  UpdateCommunicationDto,
} from './dto/communications.dto';
import { CommunicationPresenter } from './presenters/communication.presenter';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Comunicados')
@ApiBearerAuth()
@Controller('communications')
@UseGuards(JwtAuthGuard)
export class CommunicationsController {
  constructor(
    @Inject(communicationUseCaseTokens.list)
    private readonly listUC: ListCommunicationsUseCase,
    @Inject(communicationUseCaseTokens.categories)
    private readonly categoriesUC: ListCommunicationCategoriesUseCase,
    @Inject(communicationUseCaseTokens.get)
    private readonly getUC: GetCommunicationUseCase,
  ) {}
  @Get() async list(@Query() query: ListCommunicationsDto) {
    return CommunicationPresenter.toHTTPList(await this.listUC.execute(query));
  }
  @Get('categories') categories() {
    return this.categoriesUC.execute();
  }
  @Get(':slug') async get(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return CommunicationPresenter.toHTTP(
      await this.getUC.execute(slug, user.sub),
    );
  }
}

@ApiTags('Administração de comunicados')
@ApiBearerAuth()
@Controller('admin/communications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class AdminCommunicationsController {
  constructor(
    @Inject(communicationUseCaseTokens.list)
    private readonly listUC: ListCommunicationsUseCase,
    @Inject(communicationUseCaseTokens.get)
    private readonly getUC: GetCommunicationUseCase,
    @Inject(communicationUseCaseTokens.create)
    private readonly createUC: CreateCommunicationUseCase,
    @Inject(communicationUseCaseTokens.update)
    private readonly updateUC: UpdateCommunicationUseCase,
    @Inject(communicationUseCaseTokens.transition)
    private readonly transitionUC: TransitionCommunicationUseCase,
    @Inject(communicationUseCaseTokens.delete)
    private readonly deleteUC: DeleteCommunicationUseCase,
    @Inject(communicationUseCaseTokens.audit)
    private readonly auditUC: GetCommunicationAuditUseCase,
    @Inject(communicationUseCaseTokens.metrics)
    private readonly metricsUC: GetCommunicationMetricsUseCase,
  ) {}
  @Get() list(@Query() query: ListCommunicationsDto) {
    return this.listUC.execute(query, true);
  }
  @Post() create(
    @Body() dto: CreateCommunicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createUC.execute(dto, user.sub);
  }
  @Get(':id') get(@Param('id') id: string) {
    return this.getUC.executeAdmin(id);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body() dto: UpdateCommunicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.updateUC.execute(id, dto, user.sub);
  }
  @Post(':id/publish') publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.transitionUC.execute(
      id,
      CommunicationStatus.PUBLISHED,
      user.sub,
    );
  }
  @Post(':id/archive') archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.transitionUC.execute(
      id,
      CommunicationStatus.ARCHIVED,
      user.sub,
    );
  }
  @Post(':id/restore') restore(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.transitionUC.execute(id, CommunicationStatus.DRAFT, user.sub);
  }
  @Get(':id/audit') audit(@Param('id') id: string) {
    return this.auditUC.execute(id);
  }
  @Get(':id/metrics') metrics(@Param('id') id: string) {
    return this.metricsUC.execute(id);
  }
  @Delete(':id') @HttpCode(204) async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.deleteUC.execute(id, user.sub);
  }
}
