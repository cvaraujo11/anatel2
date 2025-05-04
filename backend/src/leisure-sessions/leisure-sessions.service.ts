import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeisureSession } from './entities/leisure-session.entity';
import { CreateLeisureSessionDto } from './dto/create-leisure-session.dto';
import { UpdateLeisureSessionDto } from './dto/update-leisure-session.dto';
import { User } from '../users/entities/user.entity';
import { LeisureActivity } from '../leisure-activities/entities/leisure-activity.entity';

@Injectable()
export class LeisureSessionsService {
  constructor(
    @InjectRepository(LeisureSession)
    private leisureSessionRepository: Repository<LeisureSession>,
    @InjectRepository(LeisureActivity)
    private leisureActivityRepository: Repository<LeisureActivity>,
  ) {}

  async create(createLeisureSessionDto: CreateLeisureSessionDto, user: User): Promise<LeisureSession> {
    const { leisureActivityId, start_time, end_time, ...restData } = createLeisureSessionDto;

    const leisureActivity = await this.leisureActivityRepository.findOne({ where: { id: leisureActivityId, user: { id: user.id } } });
    if (!leisureActivity) {
      throw new NotFoundException(`Leisure Activity with ID "${leisureActivityId}" not found or does not belong to the user.`);
    }

    const newSession = this.leisureSessionRepository.create({
      ...restData,
      start_time: new Date(start_time), // Converte string para Date
      end_time: end_time ? new Date(end_time) : null, // Converte string para Date se existir
      user: user,
      leisureActivity: leisureActivity,
    });

    // Calcula a duração se end_time for fornecido e duration não
    if (newSession.end_time && !newSession.duration) {
        newSession.duration = Math.round((newSession.end_time.getTime() - newSession.start_time.getTime()) / (1000 * 60)); // Duração em minutos
    }

    return this.leisureSessionRepository.save(newSession);
  }

  async findAll(user: User): Promise<LeisureSession[]> {
    return this.leisureSessionRepository.find({
      where: { user: { id: user.id } },
      relations: ['leisureActivity'], // Inclui a atividade de lazer relacionada
      order: { start_time: 'DESC' } // Ordena pela mais recente
    });
  }

  async findOne(id: string, user: User): Promise<LeisureSession> {
    const session = await this.leisureSessionRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['leisureActivity'],
    });
    if (!session) {
      throw new NotFoundException(`Leisure Session with ID "${id}" not found.`);
    }
    return session;
  }

  async update(id: string, updateLeisureSessionDto: UpdateLeisureSessionDto, user: User): Promise<LeisureSession> {
    const session = await this.findOne(id, user); // findOne já verifica a posse

    const { leisureActivityId, start_time, end_time, ...restData } = updateLeisureSessionDto;

    let leisureActivity = session.leisureActivity; // Mantém a atividade atual por padrão
    if (leisureActivityId && leisureActivityId !== session.leisureActivity.id) {
      leisureActivity = await this.leisureActivityRepository.findOne({ where: { id: leisureActivityId, user: { id: user.id } } });
      if (!leisureActivity) {
        throw new NotFoundException(`Leisure Activity with ID "${leisureActivityId}" not found or does not belong to the user.`);
      }
    }

    // Atualiza os campos fornecidos
    Object.assign(session, restData);
    if (start_time) session.start_time = new Date(start_time);
    if (end_time !== undefined) session.end_time = end_time ? new Date(end_time) : null; // Permite definir end_time como null
    session.leisureActivity = leisureActivity;

    // Recalcula a duração se start_time ou end_time mudarem e duration não for explicitamente fornecida
    if ((start_time || end_time !== undefined) && updateLeisureSessionDto.duration === undefined && session.end_time) {
        session.duration = Math.round((session.end_time.getTime() - session.start_time.getTime()) / (1000 * 60));
    } else if (updateLeisureSessionDto.duration !== undefined) {
        session.duration = updateLeisureSessionDto.duration; // Usa a duração fornecida
    } else if (end_time === null) {
        session.duration = null; // Zera a duração se end_time for null
    }


    return this.leisureSessionRepository.save(session);
  }

  async remove(id: string, user: User): Promise<void> {
    const session = await this.findOne(id, user); // findOne já verifica a posse
    const result = await this.leisureSessionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Leisure Session with ID "${id}" not found.`);
    }
  }
}