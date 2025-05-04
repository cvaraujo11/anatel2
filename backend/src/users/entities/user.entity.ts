import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { StudySession } from '../../study-sessions/entities/study-session.entity';
import { StudyMaterial } from '../../study-materials/entities/study-material.entity';
import { Meal } from '../../meals/entities/meal.entity';
import { HydrationReminder } from '../../hydration-reminders/entities/hydration-reminder.entity';
import { MealPlan } from '../../meal-plans/entities/meal-plan.entity';
import { Simulation } from '../../simulations/entities/simulation.entity';
import { Interest } from '../../interests/entities/interest.entity';
import { FocusSession } from '../../focus-sessions/entities/focus-session.entity';
import { MedicationChecklist } from '../../medication-checklist/entities/medication-checklist.entity';
import { PauseReminder } from '../../pause-reminders/entities/pause-reminder.entity';
import { Priority } from '../../priorities/entities/priority.entity';
import { LeisureSession } from '../../leisure-sessions/entities/leisure-session.entity';
import { RestSuggestion } from '../../rest-suggestions/entities/rest-suggestion.entity';
import { MoodEntry } from '../../mood-entries/entities/mood-entry.entity';
import { Medication } from '../../medications/entities/medication.entity';
import { SleepEntry } from '../../sleep-entries/entities/sleep-entry.entity';
import { SleepReminder } from '../../sleep-reminders/entities/sleep-reminder.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Note } from '../../notes/entities/note.entity';

@Entity('users') // Define o nome da tabela no banco de dados
export class User {
  @PrimaryGeneratedColumn('uuid') // Chave primária UUID gerada automaticamente
  id!: string;

  @Index({ unique: true }) // Índice único para garantir usernames exclusivos
  @Column({ type: 'varchar', length: 50, nullable: false })
  username!: string;

  @Index({ unique: true }) // Índice único para garantir emails exclusivos
  @Column({ type: 'varchar', length: 255, nullable: false })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: false }) // Mapeia para a coluna password_hash
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' }) // Coluna de data de criação gerenciada pelo TypeORM
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' }) // Coluna de data de atualização gerenciada pelo TypeORM
  updatedAt!: Date;

  @OneToMany(() => Recipe, recipe => recipe.user)
  recipes!: Recipe[]; // Adicionado '!' para indicar inicialização pelo TypeORM

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];

  @OneToMany(() => StudySession, (studySession) => studySession.user)
  studySessions: StudySession[];

  @OneToMany(() => StudyMaterial, (studyMaterial) => studyMaterial.user)
  studyMaterials: StudyMaterial[];

  @OneToMany(() => Meal, (meal) => meal.user)
  meals: Meal[];

  @OneToMany(() => HydrationReminder, (hydrationReminder) => hydrationReminder.user)
  hydrationReminders: HydrationReminder[];

  @OneToMany(() => MealPlan, (mealPlan) => mealPlan.user)
  mealPlans: MealPlan[];

  @OneToMany(() => Simulation, (simulation) => simulation.user)
  simulations: Simulation[];

  @OneToMany(() => Interest, (interest) => interest.user)
  interests: Interest[];

  @OneToMany(() => FocusSession, (focusSession) => focusSession.user)
  focusSessions: FocusSession[];

  @OneToMany(() => MedicationChecklist, (medicationChecklist) => medicationChecklist.user)
  medicationChecklists: MedicationChecklist[];

  @OneToMany(() => PauseReminder, (pauseReminder) => pauseReminder.user)
  pauseReminders: PauseReminder[];

  @OneToMany(() => Priority, (priority) => priority.user)
  priorities: Priority[];

  @OneToMany(() => LeisureSession, (leisureSession) => leisureSession.user)
  leisureSessions: LeisureSession[];

  @OneToMany(() => RestSuggestion, (restSuggestion) => restSuggestion.user)
  restSuggestions: RestSuggestion[];

  @OneToMany(() => MoodEntry, (moodEntry) => moodEntry.user)
  moodEntries: MoodEntry[];

  @OneToMany(() => Medication, (medication) => medication.user)
  medications: Medication[];

  @OneToMany(() => SleepEntry, (sleepEntry) => sleepEntry.user)
  sleepEntries: SleepEntry[];

  @OneToMany(() => SleepReminder, (sleepReminder) => sleepReminder.user)
  sleepReminders: SleepReminder[];

  @OneToMany(() => Ingredient, ingredient => ingredient.user)
  ingredients: Ingredient[];

  @OneToMany(() => Note, note => note.user)
  notes: Note[];
}