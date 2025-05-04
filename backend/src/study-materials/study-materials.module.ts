import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyMaterialsService } from './study-materials.service';
import { StudyMaterialsController } from './study-materials.controller';
import { StudyMaterial } from './entities/study-material.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudyMaterial]), AuthModule],
  controllers: [StudyMaterialsController],
  providers: [StudyMaterialsService],
})
export class StudyMaterialsModule {}