import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudySession } from './entities/study-session.entity';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { UpdateStudySessionDto } from './dto/update-study-session.dto';

@Injectable()
export class StudySessionsService {
  constructor(
    @InjectRepository(StudySession)
    private readonly studySessionRepository: Repository<StudySession>,
  ) {}

  async create(createStudySessionDto: CreateStudySessionDto, userId: string): Promise<StudySession> {
    const newSession = this.studySessionRepository.create({
      ...createStudySessionDto,
      userId: userId, // Associa a sessão ao usuário autenticado
      startTime: new Date(createStudySessionDto.startTime), // Converte string para Date
      endTime: new Date(createStudySessionDto.endTime),     // Converte string para Date
    });
    return this.studySessionRepository.save(newSession);
  }

  async findAll(userId: string): Promise<StudySession[]> {
    return this.studySessionRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<StudySession> {
    const session = await this.studySessionRepository.findOne({ where: { id } });

    if (!session) {
      throw new NotFoundException(`Study session with ID "${id}" not found`);
    }

    // Verifica se a sessão pertence ao usuário que fez a requisição
    if (session.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return session;
  }

  async update(id: string, updateStudySessionDto: UpdateStudySessionDto, userId: string): Promise<StudySession> {
    // Primeiro, busca a sessão para garantir que ela existe e pertence ao usuário
    const session = await this.findOne(id, userId); // findOne já faz a verificação de propriedade

    // Cria um payload de atualização com tipos corretos
    const updatePayload: Partial<StudySession> = {};

    // Copia propriedades do DTO, convertendo datas se necessário
    Object.keys(updateStudySessionDto).forEach(key => {
      const value = updateStudySessionDto[key];
      if (value !== undefined) { // Processa apenas chaves presentes no DTO
        if (key === 'startTime' || key === 'endTime') {
          updatePayload[key] = new Date(value);
        } else {
          updatePayload[key] = value;
        }
      }
    });

    // Atualiza a entidade encontrada com os novos dados
    // O TypeORM se encarrega de atualizar apenas os campos modificados
    const updatedSession = this.studySessionRepository.merge(session, updatePayload);

    return this.studySessionRepository.save(updatedSession);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Busca a sessão para garantir que ela existe e pertence ao usuário antes de remover
    const session = await this.findOne(id, userId); // findOne já faz a verificação de propriedade

    const result = await this.studySessionRepository.delete(id);

    if (result.affected === 0) {
      // Isso não deveria acontecer se findOne funcionou, mas é uma segurança extra
      throw new NotFoundException(`Study session with ID "${id}" not found`);
    }
  }
}