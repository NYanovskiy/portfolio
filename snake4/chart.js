let topSnakes = []; // Массив для хранения данных о змеях, которые занимали топ 1
let topSnakesChart; // Переменная для графика всех топ-змеек
let bestScoreChart; // Переменная для графика Best Score

let bestScoreHistory = []; // Массив для хранения всех Best Score и поколений

// Функция для вычисления коэффициентов линейной регрессии
function calculateLinearRegression(x, y) {
    const n = x.length;
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    const num = x.reduce((acc, xi, i) => acc + (xi - xMean) * (y[i] - yMean), 0);
    const den = x.reduce((acc, xi) => acc + (xi - xMean) ** 2, 0);

    const slope = num / den;
    const intercept = yMean - slope * xMean;

    return { slope, intercept };
}

// Функция для генерации точек линии тренда
function generateTrendLine(x, regression) {
    return x.map(xi => regression.slope * xi + regression.intercept);
}

// Инициализация данных для графика всех топ-змеек с линией тренда
function initializeTopSnakesChart() {
    const ctx = document.getElementById('topSnakesChart').getContext('2d');
    topSnakesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Поколения будут добавляться сюда
            datasets: [{
                label: 'Top Snake Scores',
                data: [], // Счета будут добавляться сюда
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
                tension: 0.1 // Линия будет плавно сглажена
            },
            {
                label: 'Линия тренда',
                data: [], // Данные для линии тренда
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                borderDash: [10, 5], // Делаем линию тренда пунктирной
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Generation'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Score'
                    }
                }
            }
        }
    });
}

// Обновляем данные для линии тренда
function updateTrendLine() {
    const x = topSnakesChart.data.labels.map(Number); // Массив поколений (X)
    const y = topSnakesChart.data.datasets[0].data; // Массив очков (Y)

    if (x.length > 1) {
        const regression = calculateLinearRegression(x, y);
        const trendLineData = generateTrendLine(x, regression);

        topSnakesChart.data.datasets[1].data = trendLineData; // Обновляем данные трендовой линии
        topSnakesChart.update(); // Обновляем график
    }
}

// Функция добавления змейки в массив топ-змеек с обновлением трендовой линии
function addTopSnake(snake, generation) {
    if (!topSnakes.some(topSnake => topSnake.generation === generation)) {
        topSnakes.push({
            generation: generation,
            score: snake.score,
            dna: { ...snake.dna },
            color: snake.color
        });

        topSnakesChart.data.labels.push(generation); // Добавляем поколение на ось X
        topSnakesChart.data.datasets[0].data.push(snake.score); // Добавляем счет на ось Y
        topSnakesChart.update(); // Обновляем график

        updateTrendLine(); // Обновляем линию тренда после добавления данных
    }
}

// Инициализация данных для графика Best Score
function initializeBestScoreChart() {
    const ctx = document.getElementById('bestScoreChart').getContext('2d');
    bestScoreChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Поколения будут добавляться сюда
            datasets: [{
                label: 'Лучший результат',
                data: [], // Лучшие счета будут добавляться сюда
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false,
                tension: 0.1 // Линия будет плавно сглажена
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Generation'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Best Score'
                    }
                }
            }
        }
    });
}

// Обновляем данные для графика Best Score
function updateBestScoreChart() {
    bestScoreChart.data.labels.push(generation); // Поколение на ось X
    bestScoreChart.data.datasets[0].data.push(bestScore); // Best Score на ось Y
    bestScoreChart.update(); // Обновляем график
}

// Функция обновления топ-змеек после каждой генерации
function checkForTopSnake() {
    const bestSnake = snakes.reduce((best, snake) => snake.score > best.score ? snake : best, snakes[0]);
    addTopSnake(bestSnake, generation); // Добавляем лучшую змею в топ
}

// Ваша основная функция nextGeneration, где будет вызываться checkForTopSnake
function nextGeneration() {
    generation++;
    generationDisplay.textContent = `Generation: ${generation}`;
    let generationBestScore = Math.max(...snakes.map(snake => snake.score));

    if (generationBestScore > bestScore) {
        bestScore = generationBestScore;
        bestScoreDisplay.textContent = `Best Score: ${bestScore}`;

        // Добавляем новый Best Score на график
        updateBestScoreChart();
    }

    const bestSnake = snakes.reduce((best, snake) => snake.score > best.score ? snake : best, snakes[0]);

    bestSnakeDNA = bestSnake.dna;

    updateLeaderboard(bestSnake);

    // Проверяем и добавляем топ-змеек
    checkForTopSnake();

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

// Инициализируем оба графика при запуске
initializeTopSnakesChart();
initializeBestScoreChart();
