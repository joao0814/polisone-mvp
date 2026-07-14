import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateTeamDto } from './dto/create-team.dto';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamsService } from './teams.service';

@ApiTags('Equipes')
@ApiBearerAuth()
@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  list(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.teamsService.list(currentUser.sub);
  }

  @Post()
  create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateTeamDto,
  ) {
    return this.teamsService.create(currentUser.sub, dto);
  }

  @Get(':id')
  getById(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) teamId: string,
  ) {
    return this.teamsService.getById(currentUser.sub, teamId);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) teamId: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(currentUser.sub, teamId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) teamId: string,
  ) {
    await this.teamsService.remove(currentUser.sub, teamId);
  }

  @Get(':id/members')
  listMembers(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) teamId: string,
  ) {
    return this.teamsService.listMembers(currentUser.sub, teamId);
  }

  @Post(':id/members')
  createMember(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) teamId: string,
    @Body() dto: CreateTeamMemberDto,
  ) {
    return this.teamsService.createMember(currentUser.sub, teamId, dto);
  }

  @Patch(':id/members/:memberId')
  updateMember(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) teamId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.teamsService.updateMember(
      currentUser.sub,
      teamId,
      memberId,
      dto,
    );
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) teamId: string,
    @Param('memberId', new ParseUUIDPipe()) memberId: string,
  ) {
    await this.teamsService.removeMember(currentUser.sub, teamId, memberId);
  }
}
