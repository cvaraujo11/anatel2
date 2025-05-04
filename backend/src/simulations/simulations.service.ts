import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Simulation } from './entities/simulation.entity';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { UpdateSimulationDto } from './dto/update-simulation.dto';
import { User } from '../users/entities/user.entity'; // Assumindo que a entidade User está aqui
import { Competition } from '../competitions/entities/competition.entity'; // Assumindo que a entidade Competition está aqui

@Injectable()
export class SimulationsService {
  constructor(
    @InjectRepository(Simulation)
    private simulationsRepository: Repository<Simulation>,
    @InjectRepository(User) // Injetar repositório de User
    private usersRepository: Repository<User>,
    @InjectRepository(Competition) // Injetar repositório de Competition
    private competitionsRepository: Repository<Competition>,
  ) {}

  async create(createSimulationDto: CreateSimulationDto, userId: string): Promise<Simulation> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const competition = await this.competitionsRepository.findOne({ where: { id: createSimulationDto.competitionId } });
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${createSimulationDto.competitionId} not found`);
    }

    const simulation = this.simulationsRepository.create({
      ...createSimulationDto,
      user: user,
      competition: competition,
    });

    return this.simulationsRepository.save(simulation);
  }

  findAllForUser(userId: string): Promise<Simulation[]> {
    return this.simulationsRepository.find({
      where: { user: { id: userId } },
      relations: ['competition'], // Incluir dados da competição
    });
  }

  async findOneForUser(id: string, userId: string): Promise<Simulation> {
    const simulation = await this.simulationsRepository.findOne({
      where: { id: id, user: { id: userId } },
      relations: ['competition'],
    });
    if (!simulation) {
      throw new NotFoundException(`Simulation with ID ${id} not found for user ${userId}`);
    }
    return simulation;
  }

  async update(id: string, updateSimulationDto: UpdateSimulationDto, userId: string): Promise<Simulation> {
    const simulation = await this.findOneForUser(id, userId); // Garante que a simulação pertence ao usuário

    // Se competitionId for fornecido no DTO, buscar e associar a competição
    if (updateSimulationDto.competitionId) {
        const competition = await this.competitionsRepository.findOne({ where: { id: updateSimulationDto.competitionId } });
        if (!competition) {
            throw new NotFoundException(`Competition with ID ${updateSimulationDto.competitionId} not found`);
        }
        simulation.competition = competition;
    }

    // Atualiza outros campos do DTO
    Object.assign(simulation, updateSimulationDto);

    return this.simulationsRepository.save(simulation);
  }

  async remove(id: string, userId: string): Promise<void> {
    const simulation = await this.findOneForUser(id, userId); // Garante que a simulação pertence ao usuário
    await this.simulationsRepository.remove(simulation);
  }
}