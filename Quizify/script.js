// --- DATABASE LOGIC ---
let questions = JSON.parse(localStorage.getItem('quiz_db')) || [];
let studentAnswers = [];
let currentIdx = 0;
let timer;

function saveToDB() {
    localStorage.setItem('quiz_db', JSON.stringify(questions));
}

// --- NAVIGATION ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hide'));
    document.getElementById(screenId).classList.remove('hide');
}

// --- ADMIN LOGIC ---
function adminLogin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === "admin123") {
        showScreen('admin-dashboard');
        renderAdminList();
    } else {
        alert("Wrong Password!");
    }
}

function saveQuestion() {
    const text = document.getElementById('q-text').value;
    const opts = Array.from(document.querySelectorAll('.opt')).map(i => i.value);
    const correct = document.getElementById('q-correct').value;

    if (!text || opts.some(o => !o)) return alert("Fill all fields");

    questions.push({ text, opts, correct: parseInt(correct) });
    saveToDB();
    renderAdminList();
    
    // Reset form
    document.getElementById('q-text').value = "";
    document.querySelectorAll('.opt').forEach(i => i.value = "");
}

function deleteQuestion(index) {
    questions.splice(index, 1);
    saveToDB();
    renderAdminList();
}

function renderAdminList() {
    const container = document.getElementById('admin-q-container');
    container.innerHTML = questions.map((q, i) => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0; display:flex; justify-content:space-between;">
            <span>${i+1}. ${q.text}</span>
            <button class="delete-btn" onclick="deleteQuestion(${i})">Delete</button>
        </div>
    `).join('');
}

// --- STUDENT LOGIC ---
function startStudentSession() {
    if (questions.length === 0) return alert("No questions added by Admin yet!");
    studentAnswers = new Array(questions.length).fill(null);
    currentIdx = 0;
    showScreen('student-panel');
    startTimer(questions.length * 60); // 1 min per question
    renderQuestion();
}

function renderQuestion() {
    const q = questions[currentIdx];
    document.getElementById('q-count').innerText = `Question ${currentIdx + 1}/${questions.length}`;
    
    let html = `<h3>${q.text}</h3>`;
    q.opts.forEach((opt, i) => {
        const isSelected = studentAnswers[currentIdx] === i;
        html += `<button class="opt-btn ${isSelected ? 'selected' : ''}" onclick="selectOpt(${i})">${opt}</button>`;
    });
    
    document.getElementById('exam-q-area').innerHTML = html;
}

function selectOpt(idx) {
    studentAnswers[currentIdx] = idx;
    renderQuestion();
}

function move(dir) {
    currentIdx += dir;
    if (currentIdx < 0) currentIdx = 0;
    if (currentIdx >= questions.length) currentIdx = questions.length - 1;
    renderQuestion();
}

function startTimer(seconds) {
    let t = seconds;
    clearInterval(timer);
    timer = setInterval(() => {
        let m = Math.floor(t / 60);
        let s = t % 60;
        document.getElementById('timer').innerText = `${m}:${s < 10 ? '0'+s : s}`;
        if (t <= 0) finishExam();
        t--;
    }, 1000);
}

function finishExam() {
    clearInterval(timer);
    let score = 0;
    questions.forEach((q, i) => {
        if (studentAnswers[i] === q.correct) score++;
    });

    const percent = ((score / questions.length) * 100).toFixed(1);
    
    showScreen('result-screen');
    document.getElementById('res-percent').innerText = percent + "%";
    document.getElementById('res-raw').innerText = `Total Score: ${score} / ${questions.length}`;
}