import pygame, sys, time, random, numpy as np
import tkinter as tk
from threading import Thread


# Настройки сложности игры (скорость игры)
difficulty = 50

# Размер окна
frame_size_x = 1024
frame_size_y = 768

# Инициализация Pygame и проверка на ошибки
check_errors = pygame.init()
if check_errors[1] > 0:
    print(f'[!] Ошибок при инициализации: {check_errors[1]}, выход...')
    sys.exit(-1)
else:
    print('[+] Инициализация прошла успешно')

# Инициализация окна игры
pygame.display.set_caption('Snake Gen Alg')
game_window = pygame.display.set_mode((frame_size_x, frame_size_y))

# Определение цветов (RGB)
black = pygame.Color(0, 0, 0)
white = pygame.Color(255, 255, 255)
green = pygame.Color(0, 255, 0)
red = pygame.Color(255, 0, 0)  # Цвет яда

# Контроллер FPS (кадров в секунду)
fps_controller = pygame.time.Clock()

# Класс Змейки
class Snake:
    def __init__(self):
        self.reset()  # Сброс состояния змейки

    def reset(self):
        # Начальные координаты змейки и её тело
        self.pos = [random.randint(0, frame_size_x // 10 - 1) * 10, random.randint(0, frame_size_y // 10 - 1) * 10]  # Голова змейки
        self.body = [self.pos[:]]  # Начальное тело состоит только из головы
        self.direction = random.choice(['UP', 'DOWN', 'LEFT', 'RIGHT'])  # Случайное начальное направление
        self.change_to = self.direction  # Направление, которое нужно сменить
        # Позиция еды
        self.food_pos = [random.randrange(1, (frame_size_x // 10)) * 10, random.randrange(1, (frame_size_y // 10)) * 10]
        self.food_spawn = True  # Флаг появления еды
        
        self.score = 0  # Очки

    # Метод для изменения направления движения змейки
    def change_dir(self, change_to):
        # Убедиться, что нельзя развернуться в противоположную сторону
        if change_to == 'UP' and self.direction != 'DOWN':
            self.direction = 'UP'
        if change_to == 'DOWN' and self.direction != 'UP':
            self.direction = 'DOWN'
        if change_to == 'LEFT' and self.direction != 'RIGHT':
            self.direction = 'LEFT'
        if change_to == 'RIGHT' and self.direction != 'LEFT':
            self.direction = 'RIGHT'

    # Метод для движения змейки
    def move(self):
        if self.direction == 'UP':
            self.pos[1] -= 10
        if self.direction == 'DOWN':
            self.pos[1] += 10
        if self.direction == 'LEFT':
            self.pos[0] -= 10
        if self.direction == 'RIGHT':
            self.pos[0] += 10

    # Метод для роста змейки и проверки съедена ли еда
    def grow(self):
        # Добавление нового сегмента к телу змейки
        self.body.insert(0, list(self.pos))
        # Проверка, съедена ли еда
        if self.pos[0] == self.food_pos[0] and self.pos[1] == self.food_pos[1]:
            self.score += 1  # Увеличение счета
            self.food_spawn = False  # Сигнал, что нужно создать новую еду
        else:
            self.body.pop()  # Если еда не съедена, убираем последний сегмент

        # Генерация новой еды
        if not self.food_spawn:
            self.food_pos = [random.randrange(1, (frame_size_x // 10)) * 10, random.randrange(1, (frame_size_y // 10)) * 10]
        self.food_spawn = True

    # Метод для проверки на столкновение
    def check_collision(self):
        # Столкновение со стенками окна
        if self.pos[0] < 0 or self.pos[0] >= frame_size_x or self.pos[1] < 0 or self.pos[1] >= frame_size_y:
            return True
        # Столкновение с собственным телом
        for block in self.body[1:]:
            if self.pos[0] == block[0] and self.pos[1] == block[1]:
                return True
        return False

    # Метод для получения состояния змейки (для генетического алгоритма)
    def get_state(self):
        return {
            "position": self.pos,
            "body": self.body,
            "direction": self.direction,
            "food": self.food_pos,
            "score": self.score
        }

    # Метод для установки состояния змейки (для генетического алгоритма)
    def set_state(self, state):
        self.pos = state["position"]
        self.body = state["body"]
        self.direction = state["direction"]
        self.food_pos = state["food"]
        self.score = state["score"]

# Функции генетического алгоритма
# Создание популяции змей
def create_population(size):
    return [Snake() for _ in range(size)]

def fitness(snake):
    # Награда за выживание
    survival_reward = snake.score * 0.1  # Награда за каждый шаг
    # Штраф за столкновения со стенками
    wall_collision_penalty = -10 if snake.pos[0] < 0 or snake.pos[0] >= frame_size_x or snake.pos[1] < 0 or snake.pos[1] >= frame_size_y else 0
    # Штраф за столкновения с телом
    body_collision_penalty = -10 if snake.pos in snake.body[1:] else 0
    # Награда за близость к еде
    food_distance = np.sqrt((snake.pos[0] - snake.food_pos[0])**2 + (snake.pos[1] - snake.food_pos[1])**2)
    food_reward = 1.0 / (food_distance + 1)  # Чем ближе к еде, тем выше награда
    # Награда за длину змейки
    length_reward = len(snake.body) * 0.1  # Награда за каждую часть тела змейки
    # Итоговая оценка
    # Штраф за столкновение с другими змеями
    other_snake_collision_penalty = -10 if check_snake_collision(snake, population) else 0
    total_fitness = survival_reward + wall_collision_penalty + body_collision_penalty + food_reward + length_reward + other_snake_collision_penalty
    # Гарантия неотрицательной оценки
    total_fitness = max(total_fitness, 0)
    
    return total_fitness


# Селекция для генетического алгоритма (выбор родителей)
def selection(population):
    fitnesses = np.array([fitness(snake) for snake in population])
    total_fitness = np.sum(fitnesses)
    
    # Обработка случая, когда все фитнесы равны нулю
    if total_fitness == 0:
        probabilities = np.ones(len(fitnesses)) / len(fitnesses)
    else:
        probabilities = fitnesses / total_fitness
    
    # Убедиться, что нет NaN или отрицательных значений в вероятностях
    probabilities = np.nan_to_num(probabilities, nan=0.0, posinf=0.0, neginf=0.0)
    probabilities = np.clip(probabilities, 0, 1)
    
    selected_indices = np.random.choice(len(population), size=2, p=probabilities)
    selected_snakes = [population[i] for i in selected_indices]
    return selected_snakes

# Кроссовер для генетического алгоритма (создание потомка)
def crossover(parent1, parent2):
    child = Snake()
    # Наследование состояния одного из родителей случайным образом
    child.set_state(parent1.get_state() if random.random() < 0.5 else parent2.get_state())
    return child

# Мутация для генетического алгоритма (изменение направления змейки)
def mutate(snake):
    if random.random() < mutation_rate:
        snake.direction = random.choice(['UP', 'DOWN', 'LEFT', 'RIGHT'])
    return snake

# Основной цикл генетического алгоритма
def genetic_algorithm(population):
    new_population = []
    for _ in range(len(population)):
        parent1, parent2 = selection(population)
        child = crossover(parent1, parent2)
        child = mutate(child)
        new_population.append(child)
    return new_population

# Эвристика для движения змейки (следование к еде)
def heuristic(snake):
    # Движение к еде
    if snake.pos[0] < snake.food_pos[0]:
        snake.change_dir('RIGHT')
    elif snake.pos[0] > snake.food_pos[0]:
        snake.change_dir('LEFT')
    elif snake.pos[1] < snake.food_pos[1]:
        snake.change_dir('DOWN')
    elif snake.pos[1] > snake.food_pos[1]:
        snake.change_dir('UP')

    # Функция для обновления значений с использованием событий
def handle_input_events():
    global population_size, mutation_rate, generations
    
    keys = pygame.key.get_pressed()
    
    # Изменение размера популяции
    if keys[pygame.K_PLUS] or keys[pygame.K_KP_PLUS]:
        population_size += 1
    if keys[pygame.K_MINUS] or keys[pygame.K_KP_MINUS]:
        population_size = max(1, population_size - 1)
    
    # Изменение коэффициента мутации
    if keys[pygame.K_UP]:
        mutation_rate = min(1.0, mutation_rate + 0.01)
    if keys[pygame.K_DOWN]:
        mutation_rate = max(0.0, mutation_rate - 0.01)
    
    # Изменение количества поколений
    if keys[pygame.K_RIGHT]:
        generations += 1
    if keys[pygame.K_LEFT]:
        generations = max(1, generations - 1)

# Основной игровой цикл
generation = 0  # Счетчик поколений
population_size = 5  # Количество змей в популяции
mutation_rate = 0.01  # Вероятность мутации
generations = 1000  # Количество поколений

# Создаем популяцию змей
population = create_population(population_size)

# Функция отображения счета и поколения
def show_score(color, font, size, score, generation, index):
    score_font = pygame.font.SysFont(font, size)
    score_surface = score_font.render(f'Snake {index+1} | Score: {score}', True, color)
    generation_surface = score_font.render(f'Generation: {generation}', True, color)
    score_rect = score_surface.get_rect()
    generation_rect = generation_surface.get_rect()
    # Смещение каждого отображаемого текста на 40 пикселей вниз для каждой змейки
    score_rect.topright = (frame_size_x - 10, 10 + index * 40)
    generation_rect.topright = (frame_size_x - 10, 30 + index * 40)
    game_window.blit(score_surface, score_rect)
    game_window.blit(generation_surface, generation_rect)

# Класс для хранения информации о лучших змеях
class BestSnake:
    def __init__(self, score, generation, index):
        self.score = score
        self.generation = generation
        self.index = index

# Интерфейс управления
def create_control_panel():
    def update_values():
        global population_size, mutation_rate, generations
        population_size = int(population_size_var.get())
        mutation_rate = float(mutation_rate_var.get())
        generations = int(generations_var.get())

    def reset_game():
        global generation, population, all_time_best_snakes
        generation = 0
        population = create_population(population_size)
        all_time_best_snakes = []

    def update_difficulty(val):
        global difficulty
        difficulty = int(val)
    
    root = tk.Tk()
    root.title("Control Panel")

    population_size_var = tk.StringVar(value=str(population_size))
    mutation_rate_var = tk.StringVar(value=str(mutation_rate))
    generations_var = tk.StringVar(value=str(generations))

    tk.Label(root, text="Размер популяции").grid(row=0, column=0)
    tk.Entry(root, textvariable=population_size_var).grid(row=0, column=1)

    tk.Label(root, text="Мутация").grid(row=1, column=0)
    tk.Entry(root, textvariable=mutation_rate_var).grid(row=1, column=1)

    tk.Label(root, text="Кол-во генираций").grid(row=2, column=0)
    tk.Entry(root, textvariable=generations_var).grid(row=2, column=1)

    tk.Button(root, text="Обновить данные", command=update_values).grid(row=3, column=0, columnspan=2)
    tk.Button(root, text="Перезагрузить игру", command=reset_game).grid(row=4, column=0, columnspan=2)
    
    tk.Label(root, text="Скорость").grid(row=5, column=0)
    tk.Scale(root, from_=5, to_=1000, orient='horizontal', command=update_difficulty).grid(row=5, column=1)
    root.mainloop()

# Запуск интерфейса управления в отдельном потоке
control_panel_thread = Thread(target=create_control_panel)
control_panel_thread.start()


# Функция отображения таблицы рейтинга слева
def show_leaderboard(color, font, size, best_snakes):
    # Сортируем лучших змей по убыванию счета
    best_snakes_sorted = sorted(best_snakes, key=lambda s: s.score, reverse=True)[:5]  # Отображаем только топ-5
    leaderboard_font = pygame.font.SysFont(font, size)
    
    for i, snake in enumerate(best_snakes_sorted):
        leaderboard_surface = leaderboard_font.render(f'{i+1}. Snake {snake.index+1} | Score: {snake.score} | Gen: {snake.generation}', True, color)
        leaderboard_rect = leaderboard_surface.get_rect()
        leaderboard_rect.topleft = (10, 10 + i * 30)
        game_window.blit(leaderboard_surface, leaderboard_rect)

# Функция обновления списка лучших змей за всё время
def update_all_time_best_snakes(all_time_best_snakes, population, generation):
    for i, snake in enumerate(population):
        # Проверяем, есть ли текущая змея уже в списке лучших по её уникальному индексу
        existing_snake = next((s for s in all_time_best_snakes if s.index == i and s.generation == generation), None)
        
        # Создаем объект BestSnake для текущей змеи
        current_snake = BestSnake(snake.score, generation, i)
        
        if existing_snake:
            # Если змея уже в списке, обновляем её счёт, если текущий счёт выше
            if current_snake.score > existing_snake.score:
                all_time_best_snakes.remove(existing_snake)
                all_time_best_snakes.append(current_snake)
        else:
            # Если список еще не полон или текущая змея лучше худшей в списке, добавляем её
            if len(all_time_best_snakes) < 50 or current_snake.score > min(all_time_best_snakes, key=lambda s: s.score).score:
                if len(all_time_best_snakes) >= 50:
                    all_time_best_snakes.remove(min(all_time_best_snakes, key=lambda s: s.score))
                all_time_best_snakes.append(current_snake)
    
    # Сортируем список всех лучших змей и сохраняем только топ-50
    all_time_best_snakes.sort(key=lambda s: s.score, reverse=True)
    all_time_best_snakes[:] = all_time_best_snakes[:50]

# Основной игровой цикл
generation = 0  # Счетчик поколений
population_size = 10  # Количество змей в популяции
mutation_rate = 0.1  # Вероятность мутации
generations = 1000  # Количество поколений

# Создаем популяцию змей
population = create_population(population_size)

# Список для хранения лучших змей за всё время
all_time_best_snakes = []

# Функция для проверки столкновения змеи с другими змеями
def check_snake_collision(snake, population):
    for other_snake in population:
        if other_snake != snake:  # Проверяем, не сравниваем ли мы змейку саму с собой
            for block in other_snake.body:
                if snake.pos == block:  # Если голова змеи совпадает с частью тела другой змеи
                    return True
    return False

# Основной игровой цикл
while True:
    generation += 1
    for snake in population:
        snake.reset()  # Сбросить состояние змейки

    while len(population) > 0:  # Продолжать пока есть хотя бы одна живая змея
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        # Обработка ввода для изменения параметров
        handle_input_events()

        # Графика (очистка экрана)
        game_window.fill(black)

        # Логика для всех змей
        for index, snake in enumerate(population[:]):  # Используем копию списка, чтобы избежать проблем при удалении элементов
            heuristic(snake)  # Использование эвристики для движения
            snake.move()  # Движение змейки
            snake.grow()  # Рост змейки
            if snake.check_collision() or check_snake_collision(snake, population):  # Проверка на столкновение
                population.remove(snake)  # Удалить змейку из популяции

            # Отрисовка змейки и еды
            for pos in snake.body:
                pygame.draw.rect(game_window, green, pygame.Rect(pos[0], pos[1], 10, 10))  # Отрисовка тела змейки
            pygame.draw.rect(game_window, white, pygame.Rect(snake.food_pos[0], snake.food_pos[1], 10, 10))  # Отрисовка еды

            # Отображение счета и поколения в правом верхнем углу для каждой змейки
            show_score(white, 'consolas', 20, snake.score, generation, index)

        # Обновление списка лучших змей за всё время
        update_all_time_best_snakes(all_time_best_snakes, population, generation)

        # Отображение таблицы рейтинга лучших змей за всё время в левой части экрана
        show_leaderboard(white, 'consolas', 20, all_time_best_snakes)

        pygame.display.update()  # Обновление экрана
        fps_controller.tick(difficulty)  # Контроль FPS

    # Проверка, что популяция пуста, перед созданием новой
    if len(population) == 0:
        # Генетический алгоритм для создания новой популяции
        population = genetic_algorithm(create_population(population_size))

    # Вывод информации о поколении
    print(f'Поколение: {generation}')

    # Завершение игры после достижения заданного количества поколений
    if generation >= generations:
        break