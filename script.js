document.addEventListener('DOMContentLoaded', () => {
    const gameSets = [
        { category: 'Djur', words: ['hund', 'katt', 'fågel', 'fisk', 'häst', 'lejon', 'tiger', 'björn'] },
        { category: 'Frukt', words: ['äpple', 'banan', 'apelsin', 'päron', 'druva', 'citron', 'mango'] },
        { category: 'Färger', words: ['röd', 'grön', 'blå', 'gul', 'svart', 'vit', 'lila', 'orange'] },
        { category: 'Kroppen', words: ['huvud', 'arm', 'ben', 'fot', 'hand', 'öga', 'näsa', 'mun'] },
        { category: 'Natur', words: ['sol', 'måne', 'stjärna', 'träd', 'blomma', 'flod', 'berg'] },
        { category: 'Svenska Städer', words: ['stockholm', 'göteborg', 'malmö', 'uppsala', 'linköping', 'örebro', 'västerås'] },
        { category: 'Maträtter', words: ['köttbullar', 'pannkakor', 'smörgåstårta', 'pyttipanna', 'surströmming', 'ärtsoppa'] },
        { category: 'I Hemmet', words: ['soffa', 'bord', 'stol', 'säng', 'lampa', 'fönster', 'dörr', 'spegel'] },
        { category: 'Yrken', words: ['läkare', 'lärare', 'polis', 'brandman', 'kock', 'ingenjör', 'snickare'] },
        { category: 'Svårare Ord', words: ['programmering', 'bibliotek', 'miljöförstöring', 'konstitution', 'extraordinär', 'vetenskap'] }
    ];

    let currentWords = [];
    let wordLocations = {};
    const gridSize = 12; // Increased grid size for better placement
    let grid = [];
    let foundWords = [];
    let selectedCells = [];

    const gridElement = document.getElementById('word-search-grid');
    const wordListElement = document.getElementById('word-list');
    const categoryTitleElement = document.querySelector('#word-list-container h2');
    const newGameButton = document.getElementById('new-game-button');
    const hintButton = document.getElementById('hint-button');

    function startNewGame() {
        const gameSet = gameSets[Math.floor(Math.random() * gameSets.length)];
        currentWords = gameSet.words.map(word => word.toLowerCase());
        categoryTitleElement.textContent = gameSet.category;
        initializeGame();
    }

    function initializeGame() {
        grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
        wordLocations = {};
        wordListElement.innerHTML = '';
        gridElement.innerHTML = '';
        gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 35px)`;
        gridElement.style.gridTemplateRows = `repeat(${gridSize}, 35px)`;
        foundWords = [];
        
        currentWords.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            li.id = `word-${word}`;
            wordListElement.appendChild(li);
        });

        placeWords();
        fillRandomLetters();
        createGrid();
    }

    function placeWords() {
        const directions = ['horizontal', 'vertical'];
        currentWords.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const direction = directions[Math.floor(Math.random() * directions.length)];
                const row = Math.floor(Math.random() * gridSize);
                const col = Math.floor(Math.random() * gridSize);

                if (canPlaceWord(word, row, col, direction)) {
                    placeWord(word, row, col, direction);
                    placed = true;
                }
                attempts++;
            }
            if (!placed) {
                console.error(`Could not place word: ${word}`);
            }
        });
    }
    
    function canPlaceWord(word, row, col, direction) {
        for (let i = 0; i < word.length; i++) {
            let r = row, c = col;
            if (direction === 'horizontal') c += i;
            else if (direction === 'vertical') r += i;
            else if (direction === 'diagonal') { r += i; c += i; }

            if (r >= gridSize || c >= gridSize || (grid[r][c] !== '' && grid[r][c] !== word[i])) {
                return false;
            }
        }
        return true;
    }

    function placeWord(word, row, col, direction) {
        wordLocations[word] = [];
        for (let i = 0; i < word.length; i++) {
            let r = row, c = col;
            if (direction === 'horizontal') c += i;
            else if (direction === 'vertical') r += i;
            else if (direction === 'diagonal') { r += i; c += i; }
            grid[r][c] = word[i];
            wordLocations[word].push({r, c});
        }
    }

    function fillRandomLetters() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyzåäö';
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === '') {
                    grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            }
        }
    }

    function createGrid() {
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.textContent = grid[r][c];
                cell.dataset.row = r;
                cell.dataset.col = c;
                gridElement.appendChild(cell);
            }
        }
    }

    let isSelecting = false;

    function handleCellSelection(cell) {
        if (cell && cell.classList.contains('grid-cell') && !selectedCells.includes(cell)) {
            selectedCells.push(cell);
            cell.classList.add('selected');
        }
    }

    function selectionStart(event) {
        isSelecting = true;
        selectedCells = [];
        handleCellSelection(event.target);
    }

    function selectionMove(event) {
        if (isSelecting) {
            let target;
            if (event.touches) {
                const touch = event.touches[0];
                target = document.elementFromPoint(touch.clientX, touch.clientY);
            } else {
                target = event.target;
            }
            handleCellSelection(target);
        }
    }

    function selectionEnd() {
        if (isSelecting) {
            isSelecting = false;
            checkSelection();
            setTimeout(() => {
                selectedCells.forEach(cell => cell.classList.remove('selected'));
                selectedCells = [];
            }, 500);
        }
    }

    // Mouse Events
    gridElement.addEventListener('mousedown', selectionStart);
    gridElement.addEventListener('mouseover', selectionMove);
    gridElement.addEventListener('mouseup', selectionEnd);
    gridElement.addEventListener('mouseleave', selectionEnd); // End selection if mouse leaves grid

    // Touch Events
    gridElement.addEventListener('touchstart', e => {
        e.preventDefault(); // Prevent scrolling while selecting
        selectionStart(e);
    });
    gridElement.addEventListener('touchmove', e => {
        e.preventDefault();
        selectionMove(e);
    });
    gridElement.addEventListener('touchend', e => {
        e.preventDefault();
        selectionEnd();
    });
    
    function checkSelection() {
        let selectedWord = selectedCells.map(cell => cell.textContent).join('');
        let reversedSelectedWord = selectedWord.split('').reverse().join('');

        currentWords.forEach(word => {
            if (!foundWords.includes(word) && (word === selectedWord || word === reversedSelectedWord)) {
                // Verify the selected cells match the word's location
                const actualLocation = wordLocations[word];
                const selectedLocation = selectedCells.map(cell => ({r: parseInt(cell.dataset.row), c: parseInt(cell.dataset.col)}));

                let isCorrect = actualLocation.every(loc => selectedLocation.some(sel => sel.r === loc.r && sel.c === loc.c)) &&
                                selectedLocation.every(sel => actualLocation.some(loc => loc.r === sel.r && sel.c === sel.c));

                if (isCorrect) {
                    foundWords.push(word);
                    document.getElementById(`word-${word}`).classList.add('found');
                    selectedCells.forEach(cell => {
                        cell.classList.add('found');
                    });
                    if (foundWords.length === currentWords.length) {
                        setTimeout(() => alert("Grattis! Du hittade alla ord!"), 300);
                    }
                }
            }
        });
    }

    function giveHint() {
        const unfoundWord = currentWords.find(word => !foundWords.includes(word));
        if (unfoundWord) {
            const firstLetterLocation = wordLocations[unfoundWord][0];
            const cell = document.querySelector(`.grid-cell[data-row='${firstLetterLocation.r}'][data-col='${firstLetterLocation.c}']`);
            cell.classList.add('selected'); // Use 'selected' style for hint
            setTimeout(() => {
                cell.classList.remove('selected');

            }, 1000);
        }
    }

    newGameButton.addEventListener('click', startNewGame);
    hintButton.addEventListener('click', giveHint);

    startNewGame();
});
