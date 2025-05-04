import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Método para criar um novo usuário com hash de senha
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword, // Corrigido para passwordHash
    });
    return this.usersRepository.save(newUser);
  }

  // Método para encontrar um usuário pelo username
  async findOneByUsername(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user ?? undefined;
  }

  // Método para encontrar um usuário pelo email
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  // Método para encontrar um usuário pelo ID
  async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  // Método para encontrar ou criar um usuário a partir dos dados do Google
  async findOrCreateFromGoogle(googleProfile: any): Promise<User> {
    let user = await this.findOneByEmail(googleProfile.email);

    if (!user) {
      // Criar novo usuário se não existir
      user = this.usersRepository.create({
        email: googleProfile.email,
        username: googleProfile.displayName || googleProfile.email, // Usar display name ou email como username
        // Outros campos do perfil do Google podem ser mapeados aqui
        passwordHash: '', // Senha vazia ou um marcador para usuários Google
      });
      await this.usersRepository.save(user);
    }

    return user;
  }

  // Outros métodos (update, remove, etc.) podem ser adicionados aqui
}