import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSimulationHistoryDto } from './dto/create-simulation-history.dto';
import { UpdateSimulationHistoryDto } from './dto/update-simulation-history.dto';
import { SimulationHistory } from './entities/simulation-history.entity';
import { Simulation } from '../simulations/entities/simulation.entity';
import { Question } from '../questions/entities/question.entity';

@Injectable()
export class SimulationHistoryService {
  constructor(
    @InjectRepository(SimulationHistory)
    private simulationHistoryRepository: Repository<SimulationHistory>,
    @InjectRepository(Simulation)
    private simulationRepository: Repository<Simulation>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async create(createSimulationHistoryDto: CreateSimulationHistoryDto): Promise<SimulationHistory> {
    const simulation = await this.simulationRepository.findOne({ where: { id: createSimulationHistoryDto.simulationId } });
    const question = await this.questionRepository.findOne({ where: { id: createSimulationHistoryDto.questionId } });

    if (!simulation) {
      throw new NotFoundException(`Simulation with ID "${createSimulationHistoryDto.simulationId}" not found`);
    }
    if (!question) {
      throw new NotFoundException(`Question with ID "${createSimulationHistoryDto.questionId}" not found`);
    }

    const simulationHistory = this.simulationHistoryRepository.create({
      ...createSimulationHistoryDto,
      simulation: simulation,
      question: question,
    });

    return this.simulationHistoryRepository.save(simulationHistory);
  }

  async findAllForSimulation(simulationId: string): Promise<SimulationHistory[]> {
    return this.simulationHistoryRepository.find({
      where: { simulation: { id: simulationId } },
      relations: ['question'],
    });
  }

  async findOne(id: string): Promise<SimulationHistory> {
    const simulationHistory = await this.simulationHistoryRepository.findOne({ where: { id }, relations: ['simulation', 'question'] });
    if (!simulationHistory) {
      throw new NotFoundException(`Simulation history with ID "${id}" not found`);
    }
    return simulationHistory;
  }

  async update(id: string, updateSimulationHistoryDto: UpdateSimulationHistoryDto): Promise<SimulationHistory> {
    const simulationHistory = await this.findOne(id); // Reuses findOne to check existence

    // Update fields from DTO
    Object.assign(simulationHistory, updateSimulationHistoryDto);

    // If simulationId or questionId are in DTO, update relations
    if (updateSimulationHistoryDto.simulationId) {
      const simulation = await this.simulationRepository.findOne({ where: { id: updateSimulationHistoryDto.simulationId } });
      if (!simulation) {
        throw new NotFoundException(`Simulation with ID "${updateSimulationHistoryDto.simulationId}" not found`);
      }
      simulationHistory.simulation = simulation;
    }

    if (updateSimulationHistoryDto.questionId) {
      const question = await this.questionRepository.findOne({ where: { id: updateSimulationHistoryDto.questionId } });
      if (!question) {
        throw new NotFoundException(`Question with ID "${updateSimulationHistoryDto.questionId}" not found`);
      }
      simulationHistory.question = question;
    }

    return this.simulationHistoryRepository.save(simulationHistory);
  }

  async remove(id: string): Promise<void> {
    const result = await this.simulationHistoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Simulation history with ID "${id}" not found`);
    }
  }
}