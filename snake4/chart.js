const ctxChart = document.getElementById('resultsChart').getContext('2d');

// Создаем график с использованием Chart.js
const chartData = {
    labels: [], // метки поколений
    datasets: [{
        label: 'Best Scores per Generation',
        data: [], // сюда будут добавляться лучшие результаты
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
    }]
};

const resultsChart = new Chart(ctxChart, {
    type: 'line',
    data: chartData,
    options: {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Score'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Generation'
                }
            }
        }
    }
});

let lastBestScore = 0; // Хранит предыдущий лучший результат для сравнения

// Функция для обновления графика
function updateChart(bestScore, generation) {
    chartData.labels.push(generation); // добавляем номер поколения в метки
    chartData.datasets[0].data.push(bestScore); // добавляем лучший результат
    resultsChart.update(); // обновляем график
}

// Функция обновления поколения
function nextGeneration() {
    generation++;
    generationDisplay.textContent = `Generation: ${generation}`;
    let generationBestScore = Math.max(...snakes.map(snake => snake.score)); // Ищем лучший результат в текущем поколении

    // Если текущий лучший результат лучше предыдущего рекорда
    if (generationBestScore > lastBestScore) {
        bestScore = generationBestScore;
        bestScoreDisplay.textContent = `Best Score: ${bestScore}`;

        const bestSnake = snakes.reduce((best, snake) => snake.score > best.score ? snake : best, snakes[0]);

        bestSnakeDNA = bestSnake.dna;

        // Обновляем таблицу рекордов и график только при новом рекорде
        updateLeaderboard(bestSnake);
        updateChart(bestScore, generation); // обновляем график только при новом топ-1

        lastBestScore = bestScore; // Обновляем последний лучший результат
    }

    // Создаем новое поколение змей на основе лучших ДНК
    snakes = Array.from({ length: populationSize }, (_, i) => {
        if (i === 0) {
            return new Snake(colors[i % colors.length], bestSnakeDNA); // Лучший змей сохраняет свои гены
        } else {
            const child = new Snake(colors[i % colors.length], { ...bestSnakeDNA }); // Потомки лучших змей с мутациями
            child.mutate(mutationRate); // Применяем мутацию
            return child;
        }
    });

    createFruits(); // Создаем новые фрукты
}
