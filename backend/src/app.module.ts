import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Para carregar variáveis de ambiente
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'; // Importa o UsersModule
import { IngredientsModule } from './ingredients/ingredients.module'; // Importa o IngredientsModule
import { RecipesModule } from './recipes/recipes.module'; // Importa o RecipesModule
import { ExpensesModule } from './expenses/expenses.module'; // Importa o ExpensesModule
import { StudySessionsModule } from './study-sessions/study-sessions.module'; // Importa o StudySessionsModule
import { StudyMaterialsModule } from './study-materials/study-materials.module'; // Importa o StudyMaterialsModule

import { MedicationChecklistModule } from './medication-checklist/medication-checklist.module'; // Importa o MedicationChecklistModule
import { FocusSessionsModule } from './focus-sessions/focus-sessions.module'; // Importa o FocusSessionsModule
import { InterestsModule } from './interests/interests.module'; // Importa o InterestsModule
import { MealsModule } from './meals/meals.module'; // Importa o MealsModule
import { PauseRemindersModule } from './pause-reminders/pause-reminders.module'; // Importa o PauseRemindersModule
import { SimulationHistoryModule } from './simulation-history/simulation-history.module'; // Importa o SimulationHistoryModule

import { ProjectsModule } from './projects/projects.module';
import { PrioritiesModule } from './priorities/priorities.module'; // Importa o PrioritiesModule
import { LeisureActivitiesModule } from './leisure-activities/leisure-activities.module'; // Importa o LeisureActivitiesModule
import { RestSuggestionsModule } from './rest-suggestions/rest-suggestions.module'; // Importa o RestSuggestionsModule
import { LeisureSessionsModule } from './leisure-sessions/leisure-sessions.module'; // Importa o LeisureSessionsModule
import { MoodEntriesModule } from './mood-entries/mood-entries.module'; // Importa o MoodEntriesModule
import { MedicationsModule } from './medications/medications.module'; // Importa o MedicationsModule
import { MoodFactorsModule } from './mood-factors/mood-factors.module'; // Importa o MoodFactorsModule
import { SleepEntriesModule } from './sleep-entries/sleep-entries.module'; // Importa o SleepEntriesModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente disponíveis globalmente
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10), // Garante que uma string seja passada para parseInt
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true, // Carrega automaticamente as entidades
      synchronize: false, // Não sincronizar em produção! Use migrations.
    }),
    AuthModule,
    UsersModule, // Registra o UsersModule
    IngredientsModule, // Registra o IngredientsModule
    RecipesModule, // Registra o RecipesModule
    ExpensesModule, // Registra o ExpensesModule
    StudySessionsModule, // Registra o StudySessionsModule
    StudyMaterialsModule, // Registra o StudyMaterialsModule
        MealsModule, // Registra o MealsModule
        SimulationHistoryModule, // Registra o SimulationHistoryModule
        InterestsModule, // Registra o InterestsModule
        ProjectsModule, // Registra o ProjectsModule
        FocusSessionsModule, // Registra o FocusSessionsModule
        MedicationChecklistModule, // Registra o MedicationChecklistModule
        PauseRemindersModule, // Registra o PauseRemindersModule
        PrioritiesModule, // Registra o PrioritiesModule
        LeisureActivitiesModule, // Registra o LeisureActivitiesModule
        RestSuggestionsModule, // Registra o RestSuggestionsModule
        LeisureSessionsModule, // Registra o LeisureSessionsModule
        MoodEntriesModule, // Registra o MoodEntriesModule
        MedicationsModule, // Registra o MedicationsModule
        MoodFactorsModule, // Registra o MoodFactorsModule
        SleepEntriesModule, // Registra o SleepEntriesModule
      ],
  controllers: [],
  providers: [],
})
export class AppModule {}