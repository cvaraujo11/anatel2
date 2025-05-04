import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CompetitionsService } from '../competitions/competitions.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    private competitionsService: CompetitionsService,
  ) {}

  async create(createQuestionDto: CreateQuestionDto, user: User): Promise<Question> {
    const competition = await this.competitionsService.findOne(createQuestionDto.competitionId, user);

    if (!competition) {
      throw new NotFoundException(`Competition with ID "${createQuestionDto.competitionId}" not found or you do not have access to it.`);
    }

    const question = this.questionsRepository.create({
      ...createQuestionDto,
      competition: competition,
    });

    return this.questionsRepository.save(question);
  }

  async findAll(user: User): Promise<Question[]> {
    // Find all questions for competitions owned by the user
    return this.questionsRepository.find({
      where: { competition: { user: { id: user.id } } },
      relations: ['competition'],
    });
  }

  async findOne(id: string, user: User): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['competition', 'competition.user'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found.`);
    }

    if (question.competition.user.id !== user.id) {
      throw new UnauthorizedException('You do not have access to this question.');
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto, user: User): Promise<Question> {
    const question = await this.findOne(id, user); // Implicitly checks ownership

    // Ensure competitionId is not being updated
    if (updateQuestionDto.competitionId && updateQuestionDto.competitionId !== question.competition.id) {
         throw new UnauthorizedException('Cannot change the competition of a question.');
    }


    this.questionsRepository.merge(question, updateQuestionDto);
    return this.questionsRepository.save(question);
  }

  async remove(id: string, user: User): Promise<void> {
    const question = await this.findOne(id, user); // Implicitly checks ownership
    await this.questionsRepository.remove(question);
  }
}