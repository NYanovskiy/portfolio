const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const generationDisplay = document.getElementById('generation');
const bestScoreDisplay = document.getElementById('bestScore');
const leaderboardDisplay = document.getElementById('leaderboard');
const snakeTableDisplay = document.getElementById('snakeTable');

const gridSize = 20; 
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;
const maxTimeWithoutFood = 20 * 60; // 20 секунд * 60 кадров в секунду

const appleImage = new Image();
appleImage.src = 'apple_077.svg';

let fastMode = false; // Флаг для ускоренного режима
let skipRendering = false; // Флаг для пропуска отрисовки змейки

// Обработчик нажатия на кнопку
document.getElementById('toggleFastMode').addEventListener('click', () => {
    fastMode = !fastMode;
    skipRendering = fastMode;
    document.getElementById('toggleFastMode').textContent = fastMode ? 'Выключить ускоренный режим' : 'Включить ускоренный режим';
});

class Snake {
    constructor(color, dna = null) {
        this.color = color;
        this.body = [{ x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }];
        this.direction = this.randomDirection();
        this.alive = true;
        this.fitness = 0;
        this.dna = dna || this.generateRandomDNA();
        this.score = 0;
        this.previousDistanceToFood = Infinity;
        this.timeWithoutFood = 0;
    }

    generateRandomDNA() {
        return {
            changeDirectionChance: Math.random() * 0.95,
            preferVertical: Math.random(),
            edgeAvoidance: Math.random() * 0.1,
            foodAttraction: Math.random() * 0.1,
            bodyAvoidance: Math.random() * 0.1,
            minChangeDirectionChance: 0.01,
            maxChangeDirectionChance: 0.5
        };
    }

    crossover(partner) {
        return Object.keys(this.dna).reduce((newDna, key) => {
            newDna[key] = Math.random() < 0.5 ? this.dna[key] : partner.dna[key];
            return newDna;
        }, {});
    }

    mutate(mutationRate) {
        Object.keys(this.dna).forEach(key => {
            if (Math.random() < mutationRate) {
                this.dna[key] = Math.random();
            }
        });

        this.dna.changeDirectionChance = Math.min(this.dna.maxChangeDirectionChance,
                                                  Math.max(this.dna.minChangeDirectionChance,
                                                           this.dna.changeDirectionChance + (Math.random() - 0.5) * 0.1));
    }

    move() {
        if (!this.alive) return;

        this.timeWithoutFood++;

        const head = { x: this.body[0].x + this.direction.x, y: this.body[0].y + this.direction.y };

        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
            this.alive = false;
            this.fitness -= 500;
            return;
        }

        if (this.body.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.alive = false;
            this.fitness -= 500;
            return;
        }

        if (snakes.some(s => s !== this && s.body.some(segment => segment.x === head.x && segment.y === head.y))) {
            this.alive = false;
            this.fitness -= 300;
            return;
        }

        if (this.timeWithoutFood > maxTimeWithoutFood) {
            this.alive = false;
            this.fitness -= 200;
            return;
        }

        this.body.unshift(head);
        this.body.pop();

        this.fitness += 5;
    }

    grow() {
        this.body.push({ ...this.body[this.body.length - 1] });
        this.fitness += 100;
        this.score += 1;
        this.timeWithoutFood = 0;
    }

    changeDirection(closestFruit) {
        const dx = closestFruit.x - this.body[0].x;
        const dy = closestFruit.y - this.body[0].y;

        const possibleDirections = [];

        const oppositeDirection = { x: -this.direction.x, y: -this.direction.y };

        if (!this.isCollision(this.body[0].x + 1, this.body[0].y) && !(oppositeDirection.x === 1 && oppositeDirection.y === 0)) {
            possibleDirections.push({ x: 1, y: 0 });
        }
        if (!this.isCollision(this.body[0].x - 1, this.body[0].y) && !(oppositeDirection.x === -1 && oppositeDirection.y === 0)) {
            possibleDirections.push({ x: -1, y: 0 });
        }
        if (!this.isCollision(this.body[0].x, this.body[0].y + 1) && !(oppositeDirection.x === 0 && oppositeDirection.y === 1)) {
            possibleDirections.push({ x: 0, y: 1 });
        }
        if (!this.isCollision(this.body[0].x, this.body[0].y - 1) && !(oppositeDirection.x === 0 && oppositeDirection.y === -1)) {
            possibleDirections.push({ x: 0, y: -1 });
        }

        if (possibleDirections.length > 0) {
            this.direction = possibleDirections.reduce((bestDirection, direction) => {
                const newHead = { x: this.body[0].x + direction.x, y: this.body[0].y + direction.y };
                const newDistance = Math.hypot(newHead.x - closestFruit.x, newHead.y - closestFruit.y);
                const collisionRisk = this.body.some(segment => segment.x === newHead.x && segment.y === newHead.y) ? 1 : 0;
                const score = newDistance - collisionRisk * this.dna.bodyAvoidance * 100;
                if (!bestDirection || score < bestDirection.score) {
                    return { ...direction, score };
                }
                return bestDirection;
            }, null);
        }
    }

    maybeChangeDirection(closestFruit) {
        if (Math.random() < this.dna.changeDirectionChance) {
            this.turnRandomly();
        } else {
            this.changeDirection(closestFruit);
        }
    }

    isNearWall() {
        const head = this.body[0];
        return head.x < 2 || head.x >= cols - 2 || head.y < 2 || head.y >= rows - 2;
    }

    isCollision(x, y) {
        return this.body.some(segment => segment.x === x && segment.y === y) ||
               x < 0 || x >= cols || y < 0 || y >= rows;
    }

    turnRandomly() {
        const directions = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];

        const oppositeDirection = { x: -this.direction.x, y: -this.direction.y };
        this.direction = directions.filter(d => d.x !== oppositeDirection.x || d.y !== oppositeDirection.y)[Math.floor(Math.random() * 3)];
    }

    randomDirection() {
        const directions = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    calculateFitness(closestFruit) {
        const distance = Math.hypot(this.body[0].x - closestFruit.x, this.body[0].y - closestFruit.y);

        if (distance < this.previousDistanceToFood) {
            this.fitness += Math.round(this.dna.foodAttraction * 20);
        } else {
            this.fitness -= Math.round(this.dna.foodAttraction * 10);
        }

        this.previousDistanceToFood = distance;

        const head = this.body[0];
        const bodyProximity = this.body.some(segment => Math.abs(segment.x - head.x) + Math.abs(segment.y - head.y) <= 1) ? 1 : 0;
        if (bodyProximity) {
            this.fitness -= this.dna.bodyAvoidance * 50;
        }
    }

    draw() {
        if (!this.alive || skipRendering) return; // Рисовать только живых змей и если не пропускается отрисовка
        ctx.fillStyle = this.color;
        this.body.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            ctx.strokeStyle = 'green';
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
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
            position = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
        } while (snakeBodies.some(body => body.some(segment => segment.x === position.x && segment.y === position.y)));
        return position;
    }

    draw() {
        if (!skipRendering) {
            if (appleImage.complete) {
                ctx.drawImage(appleImage, this.position.x * gridSize, this.position.y * gridSize, gridSize, gridSize);
            } else {
                appleImage.onload = () => {
                    ctx.drawImage(appleImage, this.position.x * gridSize, this.position.y * gridSize, gridSize, gridSize);
                };
            }
        }
    }
}

let populationSize = parseInt(document.getElementById('populationSize').value);
let mutationRate = parseFloat(document.getElementById('mutationRate').value);
let numberOfFruits = parseInt(document.getElementById('numberOfFruits').value);
let snakes = [];
const colors = ['#ff0000', '#ff8700', '#ffd300', '#deff0a', '#a1ff0a', '#0aff99', '#0aefff', '#147df5', '#580aff', '#be0aff'];
let fruits = [];
let generation = 0;
let bestScore = 0;
let bestSnakeDNA = null;

let leaderboard = [];

function createInitialPopulation() {
    snakes = Array.from({ length: populationSize }, (_, i) => new Snake(colors[i % colors.length], bestSnakeDNA));
}

function createFruits() {
    fruits = Array.from({ length: numberOfFruits }, () => new Fruit(snakes.map(s => s.body)));
}

function updateLeaderboard(bestSnake) {
    leaderboard.push({ score: bestSnake.score, generation: generation });
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 10) {
        leaderboard.pop();
    }

    let leaderboardHtml = leaderboard.map((entry, index) => `${index + 1}. Счет: ${entry.score} | Snake Gen: ${entry.generation}`).join('<br>');
    leaderboardDisplay.innerHTML = leaderboardHtml;
}

function updateSnakeTable() {
    let snakeTableHtml = snakes.map((snake, index) => {
        let statusColor = snake.alive ? 'green' : 'red';
        return `
            <div style="display: flex; align-items: center;">
                <div>${index + 1}. Snake | Счет: ${snake.score}</div>
                <div style="width: 20px; height: 20px; background-color: ${statusColor}; margin-left: 10px;"></div>
            </div>`;
    }).join('');
    snakeTableDisplay.innerHTML = snakeTableHtml;
}

function nextGeneration() {
    generation++;
    generationDisplay.textContent = `Generation: ${generation}`;
    let generationBestScore = Math.max(...snakes.map(snake => snake.score));

    bestScore = Math.max(bestScore, generationBestScore);
    bestScoreDisplay.textContent = `Best Score: ${bestScore}`;

    const bestSnake = snakes.reduce((best, snake) => snake.score > best.score ? snake : best, snakes[0]);

    bestSnakeDNA = bestSnake.dna;

    updateLeaderboard(bestSnake);

    snakes = Array.from({ length: populationSize }, (_, i) => {
        if (i === 0) {
            return new Snake(colors[i % colors.length], bestSnakeDNA);
        } else {
            const child = new Snake(colors[i % colors.length], { ...bestSnakeDNA });
            child.mutate(mutationRate);
            return child;
        }
    });

    createFruits();
}

function findClosestFruit(snake) {
    return fruits.reduce((closest, fruit) => {
        const distance = Math.hypot(snake.body[0].x - fruit.position.x, snake.body[0].y - fruit.position.y);
        return distance < closest.distance ? { position: fruit.position, distance } : closest;
    }, { distance: Infinity }).position;
}

let frameCount = 0;

function gameLoop() {
    if (fastMode) {
        // Если включен ускоренный режим, пропускаем кадры
        for (let i = 0; i < 20; i++) {
            updateGameLogic();
        }
    } else {
        updateGameLogic();
    }

    if (!skipRendering) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snakes.forEach(snake => snake.draw());
        fruits.forEach(fruit => fruit.draw());
    }

    updateSnakeTable(); // Обновляем таблицу змеек

    requestAnimationFrame(gameLoop);
}

function updateGameLogic() {
    frameCount++;
    if (frameCount % 10 === 0) {
        snakes.forEach(snake => {
            if (snake.alive) {
                const closestFruit = findClosestFruit(snake);
                if (closestFruit) {
                    snake.maybeChangeDirection(closestFruit);
                    snake.calculateFitness(closestFruit);
                }
                snake.move();

                fruits.forEach((fruit, index) => {
                    if (snake.alive && snake.body[0].x === fruit.position.x && snake.body[0].y === fruit.position.y) {
                        snake.grow();
                        fruits[index] = new Fruit(snakes.map(s => s.body));
                    }
                });

                if (!snake.alive) {
                    // Убираем змею с поля после смерти
                    snake.body = [];
                }
            }
        });

        if (snakes.every(snake => !snake.alive)) {
            nextGeneration();
        }
    }
}

function restartSimulation() {
    populationSize = parseInt(document.getElementById('populationSize').value);
    mutationRate = parseFloat(document.getElementById('mutationRate').value);
    numberOfFruits = parseInt(document.getElementById('numberOfFruits').value);
    generation = 0;
    bestScore = 0;
    leaderboard = [];
    createInitialPopulation();
    createFruits();
}

createInitialPopulation();
createFruits();
gameLoop();
