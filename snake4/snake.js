const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20; // размер клетки
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

class Snake {
    constructor(color) {
        this.color = color;
        this.body = [{ x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }];
        this.direction = this.randomDirection();
        this.alive = true;
        this.stepDelay = 500; // Начальная задержка между шагами
        this.isMoving = false;
    }

    randomDirection() {
        const directions = [
            { x: 0, y: -1 }, // вверх
            { x: 0, y: 1 },  // вниз
            { x: -1, y: 0 }, // влево
            { x: 1, y: 0 }   // вправо
        ];
        return directions[Math.floor(Math.random() * directions.length)];
    }

// В методе move класса Snake
move() {
    if (!this.alive) return;

    const head = { x: this.body[0].x + this.direction.x, y: this.body[0].y + this.direction.y };

    // Проверка на столкновение с границами поля
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        // Обработка столкновения со стеной
    }

    // Проверка на столкновение с другими змеями
    if (snakes.some(s => s !== this && s.body.some(segment => segment.x === head.x && segment.y === head.y))) {
        // Обработка столкновения с другой змеей
    }

    // Логика продолжения движения змеи
}

    grow() {
        const tail = this.body[this.body.length - 1];
        this.body.push({ x: tail.x, y: tail.y }); // Увеличиваем длину змеи
    }

    async move() {
        if (this.isMoving || !this.alive) return;

        this.isMoving = true;

        const head = { x: this.body[0].x + this.direction.x, y: this.body[0].y + this.direction.y };

        // Логика столкновений

        this.body.unshift(head); // Добавляем новую голову
        this.body.pop(); // Убираем последний сегмент

        await new Promise(resolve => setTimeout(resolve, this.stepDelay)); // Задержка между шагами
        this.isMoving = false;
    }

    // Другие методы класса Snake

    changeDirection(fruitPosition) {
        const dx = fruitPosition.x - this.body[0].x;
        const dy = fruitPosition.y - this.body[0].y;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = { x: Math.sign(dx), y: 0 }; // Движение по горизонтали
        } else {
            this.direction = { x: 0, y: Math.sign(dy) }; // Движение по вертикали
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        this.body.forEach((segment) => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            ctx.strokeStyle = 'black'; // Цвет обводки
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize); // Обводка сегмента
        });
    }
}

class Fruit {
    constructor(snakeBodies) {
        this.position = this.randomPosition(snakeBodies);
    }

    randomPosition(snakeBodies) {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * cols),
                y: Math.floor(Math.random() * rows)
            };
        } while (snakeBodies.some(body => body.x === position.x && body.y === position.y));
        return position;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.position.x * gridSize + gridSize / 2, this.position.y * gridSize + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'black'; // Цвет обводки фрукта
        ctx.stroke();
    }
}

const snakes = [];
const colors = ['green', 'blue', 'orange', 'purple', 'yellow', 'pink', 'cyan', 'brown', 'lime', 'magenta'];

// Создание от 5 до 10 змей
for (let i = 0; i < 5 + Math.floor(Math.random() * 6); i++) {
    snakes.push(new Snake(colors[i % colors.length]));
}

let fruit = new Fruit(snakes.map(snake => snake.body));

let frameCount = 0;

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frameCount++;
    if (frameCount % 30 === 0) { // Update game state every 30 frames
        snakes.forEach(snake => {
            snake.move();

            // Проверка на поедание фрукта
            if (snake.alive && snake.body[0].x === fruit.position.x && snake.body[0].y === fruit.position.y) {
                snake.grow();
                fruit = new Fruit(snakes.map(s => s.body)); // Перемещаем фрукт в новое место
            }

            // Изменение направления случайным образом
            if (Math.random() < 0.1) { // 10% шанс изменить направление
                snake.changeDirection(snake.randomDirection());
            }
        });
    }

    snakes.forEach(snake => {
        snake.changeDirection(fruit.position); // Передача позиции фрукта
        snake.move();
        snake.draw();
    });
    fruit.draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();