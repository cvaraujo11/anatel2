import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLeisureActivityDto } from './dto/create-leisure-activity.dto';
import { UpdateLeisureActivityDto } from './dto/update-leisure-activity.dto';
import { LeisureActivity } from './entities/leisure-activity.entity';

@Injectable()
export class LeisureActivitiesService {
  constructor(
    @InjectRepository(LeisureActivity)
    private readonly leisureActivityRepository: Repository<LeisureActivity>,
  ) {}

  async create(createLeisureActivityDto: CreateLeisureActivityDto, userId: string): Promise<LeisureActivity> {
    const newActivity = this.leisureActivityRepository.create({
      ...createLeisureActivityDto,
      user: { id: userId }, // Associa a atividade ao usuário
    });
    return this.leisureActivityRepository.save(newActivity);
  }

  async findAll(userId: string): Promise<LeisureActivity[]> {
    return this.leisureActivityRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' }, // Ordena por data de criação, mais recentes primeiro
    });
  }

  async findOne(id: string, userId: string): Promise<LeisureActivity> {
    const activity = await this.leisureActivityRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!activity) {
      // Verifica se a atividade existe, mas pertence a outro usuário
      const exists = await this.leisureActivityRepository.findOne({ where: { id } });
      if (exists) {
        throw new ForbiddenException('Você não tem permissão para acessar esta atividade.');
      } else {
        throw new NotFoundException(`Atividade de lazer com ID "${id}" não encontrada.`);
      }
    }
    return activity;
  }

  async update(id: string, updateLeisureActivityDto: UpdateLeisureActivityDto, userId: string): Promise<LeisureActivity> {
    const activity = await this.findOne(id, userId); // findOne já verifica a propriedade

    // Atualiza apenas os campos fornecidos no DTO
    Object.assign(activity, updateLeisureActivityDto);

    return this.leisureActivityRepository.save(activity);
  }

  async remove(id: string, userId: string): Promise<void> {
    const activity = await this.findOne(id, userId); // findOne já verifica a propriedade
    const result = await this.leisureActivityRepository.delete({ id: activity.id }); // Usa delete para remover permanentemente

    if (result.affected === 0) {
      // Caso raro, mas garante que a exclusão ocorreu
      throw new NotFoundException(`Não foi possível remover a atividade de lazer com ID "${id}".`);
    }
  }
}