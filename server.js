// =============================
// server.js (ЖҰМЫС БЕРУШІ РЕЖИМІМЕН)
// =============================

const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// Деректер орналасатын папка
// -----------------------------
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Көмекші функциялар
function getFilePath(name) {
  return path.join(dataDir, `${name}.json`);
}

function readJSON(name) {
  const file = getFilePath(name);

  if (!fs.existsSync(file)) {
    // Файл жоқ болса, әдепкі мән қайтару
    if (name === "analytics") return {};
    if (name === "employers") return [];
    if (name === "currentEmployer") return null;  // null қайтару керек, бос емес
    return [];
  }

  const content = fs.readFileSync(file, 'utf-8').trim();
  
  // Егер файл бос болса немесе "null" болса
  if (content === '' || content === 'null') {
    if (name === "analytics") return {};
    if (name === "employers") return [];
    if (name === "currentEmployer") return null;
    if (name === "currentUser") return null;
    return [];
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(`JSON парсинг қатесі ${name} файлы үшін:`, error);
    // Қате болса, әдепкі мән қайтару
    if (name === "analytics") return {};
    if (name === "employers") return [];
    if (name === "currentEmployer") return null;
    return [];
  }
}

function writeJSON(name, data) {
  fs.writeFileSync(getFilePath(name), JSON.stringify(data, null, 2));
}

// -----------------------------
// ӘМБЕБАП API
// -----------------------------

// Барлық деректерді оқу
app.get("/api/:key", (req, res) => {
  const key = req.params.key;
  res.json(readJSON(key));
});
// =============================
// ЖҰМЫС БЕРУШІ БЕТІ
// =============================

// Жұмыс беруші кіру беті (GET)
app.get("/employer", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="kk">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Жұмыс беруші - Студент портфолиолары</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; }
            .gradient-bg { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }
        </style>
    </head>
    <body class="min-h-screen bg-gray-50">
        <div class="gradient-bg min-h-screen flex items-center justify-center p-4">
            <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-900">Жұмыс беруші кіру</h1>
                    <p class="text-gray-600 mt-2">Талантты студенттерді табу үшін</p>
                </div>

                <form id="employerLoginForm" class="space-y-6">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="email" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Құпиясөз</label>
                        <input type="password" id="password" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>

                    <div id="errorMessage" class="hidden text-red-600 text-sm"></div>

                    <button type="submit" 
                            class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                        Кіру
                    </button>

                    <div class="text-center">
                        <p class="text-gray-600 text-sm">Аккаунтыңыз жоқ па? 
                            <a href="#" id="registerLink" class="text-purple-600 hover:text-purple-700 font-medium">Тіркелу</a>
                        </p>
                        <p class="text-gray-600 text-sm mt-2">
                            <a href="/" class="text-gray-500 hover:text-gray-700">← Басты бетке қайту</a>
                        </p>
                    </div>
                </form>

                <form id="employerRegisterForm" class="space-y-6 hidden">
                    <div>
                        <label for="regCompany" class="block text-sm font-medium text-gray-700 mb-1">Компания аты</label>
                        <input type="text" id="regCompany" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="regFirstName" class="block text-sm font-medium text-gray-700 mb-1">Аты</label>
                            <input type="text" id="regFirstName" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        </div>
                        <div>
                            <label for="regLastName" class="block text-sm font-medium text-gray-700 mb-1">Тегі</label>
                            <input type="text" id="regLastName" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        </div>
                    </div>

                    <div>
                        <label for="regEmail" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="regEmail" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label for="regPassword" class="block text-sm font-medium text-gray-700 mb-1">Құпиясөз</label>
                        <input type="password" id="regPassword" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>

                    <div id="registerErrorMessage" class="hidden text-red-600 text-sm"></div>

                    <button type="submit" 
                            class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        Тіркелу
                    </button>

                    <div class="text-center">
                        <p class="text-gray-600 text-sm">Аккаунтыңыз бар ма? 
                            <a href="#" id="loginLink" class="text-purple-600 hover:text-purple-700 font-medium">Кіру</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>

        <script>
            // Формаларды ауыстыру
            document.getElementById('registerLink').addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('employerLoginForm').classList.add('hidden');
                document.getElementById('employerRegisterForm').classList.remove('hidden');
            });

            document.getElementById('loginLink').addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('employerRegisterForm').classList.add('hidden');
                document.getElementById('employerLoginForm').classList.remove('hidden');
            });

            // Кіру формасы
            document.getElementById('employerLoginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const errorDiv = document.getElementById('errorMessage');

                errorDiv.classList.add('hidden');

                try {
                    const response = await fetch('/api/employers/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Сәтті кіргенде, студенттер тізіміне бағыттау
                        window.location.href = '/employer/dashboard';
                    } else {
                        errorDiv.textContent = result.error;
                        errorDiv.classList.remove('hidden');
                    }
                } catch (error) {
                    errorDiv.textContent = 'Сервер қатесі';
                    errorDiv.classList.remove('hidden');
                }
            });

            // Тіркелу формасы
            document.getElementById('employerRegisterForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const company = document.getElementById('regCompany').value;
                const firstname = document.getElementById('regFirstName').value;
                const lastname = document.getElementById('regLastName').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const errorDiv = document.getElementById('registerErrorMessage');

                errorDiv.classList.add('hidden');

                try {
                    const response = await fetch('/api/employers/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ company, firstname, lastname, email, password })
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Тіркелгенде, студенттер тізіміне бағыттау
                        window.location.href = '/employer/dashboard';
                    } else {
                        errorDiv.textContent = result.error;
                        errorDiv.classList.remove('hidden');
                    }
                } catch (error) {
                    errorDiv.textContent = 'Тіркелу қатесі';
                    errorDiv.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Жұмыс беруші бақылау тақтасы
app.get("/employer/dashboard", (req, res) => {
  // currentEmployer тексеру
  const currentEmployer = readJSON("currentEmployer");
  
  if (!currentEmployer || !currentEmployer.employer) {
    // Егер кірмеген болса, кіру бетіне қайтару
    return res.redirect('/employer');
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="kk">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Жұмыс беруші панелі - ${currentEmployer.employer.company}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; }
            .gradient-bg { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }
            .card-hover { transition: all 0.3s ease; }
            .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body class="min-h-screen bg-gray-50">
        <!-- Навигация -->
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-purple-600 rounded-full"></div>
                        <h1 class="text-xl font-bold text-gray-900">${currentEmployer.employer.company}</h1>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <span class="text-gray-700">${currentEmployer.employer.firstname} ${currentEmployer.employer.lastname}</span>
                        <button onclick="logout()" 
                                class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                            Шығу
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Басты мазмұн -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Студенттер портфолиолары</h1>
                <p class="text-gray-600 mt-2">Барлық тіркелген студенттердің жұмыстары</p>
            </div>

            <!-- Іздеу -->
            <div class="mb-6">
                <input type="text" id="searchInput" 
                       placeholder="Студент аты, email немесе дағды бойынша іздеу..." 
                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       onkeyup="searchStudents()">
            </div>

            <!-- Статистика -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <p class="text-sm font-medium text-gray-600">Барлық студенттер</p>
                    <p id="totalStudents" class="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <p class="text-sm font-medium text-gray-600">Жобалар саны</p>
                    <p id="totalProjects" class="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <p class="text-sm font-medium text-gray-600">Белсенді студенттер</p>
                    <p id="activeStudents" class="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <p class="text-sm font-medium text-gray-600">Орташа жоба</p>
                    <p id="avgProjects" class="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
            </div>

            <!-- Студенттер тізімі -->
            <div id="studentsContainer" class="space-y-4">
                <p class="text-center text-gray-500 py-8">Жүктелуде...</p>
            </div>
        </div>

        <script>
            let allStudents = [];
            let allProjects = [];

            // Шығу функциясы
            function logout() {
                fetch('/api/employers/logout', {
                    method: 'POST'
                }).then(() => {
                    window.location.href = '/employer';
                });
            }

            // Студенттерді жүктеу
            async function loadStudents() {
                try {
                    // Студенттерді алу
                    const studentsRes = await fetch('/api/employer/students');
                    allStudents = await studentsRes.json();
                    
                    // Жобаларды алу
                    const projectsRes = await fetch('/api/employer/all-projects');
                    allProjects = await projectsRes.json();

                    // Статистиканы жаңарту
                    updateStats();
                    
                    // Студенттер тізімін көрсету
                    displayStudents(allStudents);
                } catch (error) {
                    console.error('Жүктеу қатесі:', error);
                    document.getElementById('studentsContainer').innerHTML = 
                        '<p class="text-center text-red-500 py-8">Жүктеу қатесі</p>';
                }
            }

            // Статистиканы жаңарту
            function updateStats() {
                document.getElementById('totalStudents').textContent = allStudents.length;
                document.getElementById('totalProjects').textContent = allProjects.length;
                
                // Белсенді студенттер (жобасы бар)
                const activeStudents = allStudents.filter(student => {
                    const studentProjects = allProjects.filter(p => p.user_id === student.id);
                    return studentProjects.length > 0;
                }).length;
                document.getElementById('activeStudents').textContent = activeStudents;

                // Орташа жоба саны
                const avgProjects = allStudents.length > 0 
                    ? (allProjects.length / allStudents.length).toFixed(1)
                    : 0;
                document.getElementById('avgProjects').textContent = avgProjects;
            }

            // Студенттерді көрсету
            function displayStudents(students) {
                const container = document.getElementById('studentsContainer');
                
                if (students.length === 0) {
                    container.innerHTML = '<p class="text-center text-gray-500 py-8">Студенттер табылмады</p>';
                    return;
                }

                container.innerHTML = students.map(student => {
                    const studentProjects = allProjects.filter(p => p.user_id === student.id);
                    
                    return \`
                        <div class="bg-white rounded-lg shadow border border-gray-200 p-6 card-hover">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center space-x-4">
                                    <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span class="text-lg font-bold text-purple-600">
                                            \${student.firstname ? student.firstname.charAt(0) : 'S'}\${student.lastname ? student.lastname.charAt(0) : 'T'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">
                                            \${student.firstname || ''} \${student.lastname || ''}
                                        </h3>
                                        <p class="text-sm text-gray-600">@\${student.username || 'student'}</p>
                                        <p class="text-xs text-gray-500">\${student.email}</p>
                                    </div>
                                </div>
                                
                                <button onclick="viewStudentDetail('\${student.id}')" 
                                        class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                    Портфолионы қарау
                                </button>
                            </div>

                            \${student.bio ? \`
                                <p class="text-gray-600 mt-4 text-sm">\${student.bio}</p>
                            \` : ''}

                            <div class="grid grid-cols-3 gap-4 mt-4 text-center">
                                <div class="bg-gray-50 p-3 rounded-lg">
                                    <p class="text-sm text-gray-600">Жобалар</p>
                                    <p class="text-xl font-bold text-gray-900">\${studentProjects.length}</p>
                                </div>
                                <div class="bg-gray-50 p-3 rounded-lg">
                                    <p class="text-sm text-gray-600">Портфолио</p>
                                    <p class="text-xl font-bold text-gray-900">\${student.portfolioCount || 0}</p>
                                </div>
                                <div class="bg-gray-50 p-3 rounded-lg">
                                    <p class="text-sm text-gray-600">Көрулер</p>
                                    <p class="text-xl font-bold text-gray-900">\${student.profileViews || 0}</p>
                                </div>
                            </div>

                            \${studentProjects.length > 0 ? \`
                                <div class="mt-4">
                                    <p class="text-sm font-medium text-gray-700 mb-2">Соңғы жобалар:</p>
                                    <div class="space-y-2">
                                        \${studentProjects.slice(0, 3).map(project => \`
                                            <div class="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                                <span class="text-gray-600 truncate">\${project.title}</span>
                                                <span class="text-xs px-2 py-1 rounded-full \${getStatusColor(project.status)}">
                                                    \${getStatusLabel(project.status)}
                                                </span>
                                            </div>
                                        \`).join('')}
                                    </div>
                                </div>
                            \` : ''}
                        </div>
                    \`;
                }).join('');
            }

            // Іздеу функциясы
            function searchStudents() {
                const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                
                const filtered = allStudents.filter(student => {
                    const fullName = \`\${student.firstname || ''} \${student.lastname || ''}\`.toLowerCase();
                    const username = (student.username || '').toLowerCase();
                    const email = (student.email || '').toLowerCase();
                    const bio = (student.bio || '').toLowerCase();
                    
                    return fullName.includes(searchTerm) || 
                           username.includes(searchTerm) || 
                           email.includes(searchTerm) ||
                           bio.includes(searchTerm);
                });
                
                displayStudents(filtered);
            }

            // Студенттің толық мәліметін көру
            function viewStudentDetail(studentId) {
                window.location.href = \`/employer/student/\${studentId}\`;
            }

            // Жоба мәртебесі үшін түс
            function getStatusColor(status) {
                const colors = {
                    'completed': 'bg-green-100 text-green-800',
                    'in-progress': 'bg-yellow-100 text-yellow-800',
                    'planned': 'bg-gray-100 text-gray-800'
                };
                return colors[status] || 'bg-gray-100 text-gray-800';
            }

            // Жоба мәртебесі
            function getStatusLabel(status) {
                const labels = {
                    'completed': 'Аяқталды',
                    'in-progress': 'Орындалуда',
                    'planned': 'Жоспарланған'
                };
                return labels[status] || status;
            }

            // Жүктеу басталғанда
            document.addEventListener('DOMContentLoaded', loadStudents);
        </script>
    </body>
    </html>
  `);
});

// Жұмыс беруші үшін студенттің толық мәліметі
app.get("/employer/student/:id", (req, res) => {
  const currentEmployer = readJSON("currentEmployer");
  
  if (!currentEmployer || !currentEmployer.employer) {
    return res.redirect('/employer');
  }

  const studentId = req.params.id;
  const users = readJSON("users");
  const projects = readJSON("projects");
  const portfolio = readJSON("portfolio");
  const analytics = readJSON("analytics");

  const student = users.find(u => u.id === studentId);
  
  if (!student) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Студент табылмады</title></head>
      <body class="p-8">
        <h1 class="text-2xl text-red-600">Студент табылмады</h1>
        <a href="/employer/dashboard" class="text-blue-600">← Артқа</a>
      </body>
      </html>
    `);
  }

  const studentProjects = projects.filter(p => p.user_id === studentId);
  const studentPortfolio = portfolio.filter(p => p.user_id === studentId);
  const studentAnalytics = analytics[studentId] || { profileViews: 0 };

  res.send(`
    <!DOCTYPE html>
    <html lang="kk">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${student.firstname} ${student.lastname} - Портфолио</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-gray-50">
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-3">
                        <a href="/employer/dashboard" class="text-gray-700 hover:text-gray-900">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </a>
                        <h1 class="text-xl font-bold text-gray-900">${student.firstname} ${student.lastname} - Портфолио</h1>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Студент ақпараты -->
            <div class="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
                <div class="flex items-start space-x-6">
                    <div class="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                        <span class="text-3xl font-bold text-purple-600">
                            ${student.firstname ? student.firstname.charAt(0) : ''}${student.lastname ? student.lastname.charAt(0) : ''}
                        </span>
                    </div>
                    
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold text-gray-900">${student.firstname} ${student.lastname}</h2>
                        <p class="text-gray-600">${student.email}</p>
                        <p class="text-gray-600">@${student.username}</p>
                        
                        ${student.bio ? `
                            <div class="mt-4">
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Өзі туралы:</h3>
                                <p class="text-gray-700">${student.bio}</p>
                            </div>
                        ` : ''}
                        
                        <div class="mt-4 flex space-x-4">
                            <button onclick="downloadStudentCV('${student.id}')" 
                                    class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                                CV жүктеу
                            </button>
                            <a href="mailto:${student.email}" 
                               class="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50">
                                Email жіберу
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Статистика -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <p class="text-sm font-medium text-gray-600">Жобалар</p>
                    <p class="text-3xl font-bold text-gray-900 mt-2">${studentProjects.length}</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <p class="text-sm font-medium text-gray-600">Портфолио</p>
                    <p class="text-3xl font-bold text-gray-900 mt-2">${studentPortfolio.length}</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <p class="text-sm font-medium text-gray-600">Профиль көрулері</p>
                    <p class="text-3xl font-bold text-gray-900 mt-2">${studentAnalytics.profileViews}</p>
                </div>
            </div>

            <!-- Жобалар -->
            <div class="bg-white rounded-lg shadow border border-gray-200 mb-8">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-900">Жобалар (${studentProjects.length})</h3>
                </div>
                
                <div class="p-6">
                    ${studentProjects.length === 0 ? `
                        <p class="text-center text-gray-500 py-8">Әлі жобалар жоқ</p>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            ${studentProjects.map(project => `
                                <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div class="flex justify-between items-start mb-3">
                                        <h4 class="font-semibold text-lg text-gray-900">${project.title}</h4>
                                        <span class="text-xs px-2 py-1 rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}">
                                            ${project.status === 'completed' ? 'Аяқталды' : project.status === 'in-progress' ? 'Орындалуда' : 'Жоспарланған'}
                                        </span>
                                    </div>
                                    
                                    <p class="text-gray-600 mb-3">${project.description}</p>
                                    
                                    ${project.skills ? `
                                        <p class="text-sm text-gray-500 mb-2">
                                            <strong>Технологиялар:</strong> ${project.skills}
                                        </p>
                                    ` : ''}
                                    
                                    <p class="text-sm text-gray-500 mb-3">
                                        <strong>Санат:</strong> ${project.category}
                                    </p>
                                    
                                    ${project.files && project.files.length > 0 ? `
                                        <div class="mb-3">
                                            <p class="text-sm font-medium text-gray-700 mb-1">Файлдар:</p>
                                            <div class="space-y-1">
                                                ${project.files.map(file => `
                                                    <div class="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                                        <span class="text-gray-600 truncate">${file.name}</span>
                                                        <div class="flex space-x-1">
                                                            <button onclick="previewFile('${file.data}', '${file.name}')" 
                                                                    class="text-blue-600 hover:text-blue-800"
                                                                    title="Ашу">
                                                                Көру
                                                            </button>
                                                            <button onclick="downloadFile('${file.data}', '${file.name}')" 
                                                                    class="text-purple-600 hover:text-purple-800"
                                                                    title="Жүктеу">
                                                                Жүктеу
                                                            </button>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    <p class="text-xs text-gray-400">
                                        Жасалған күні: ${new Date(project.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>

            <!-- Портфолио -->
            <div class="bg-white rounded-lg shadow border border-gray-200">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-900">Портфолио (${studentPortfolio.length})</h3>
                </div>
                
                <div class="p-6">
                    ${studentPortfolio.length === 0 ? `
                        <p class="text-center text-gray-500 py-8">Әлі портфолио элементтері жоқ</p>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            ${studentPortfolio.map(item => `
                                <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div class="flex justify-between items-start mb-3">
                                        <h4 class="font-semibold text-gray-900">${item.title}</h4>
                                        <span class="text-xs px-2 py-1 rounded-full ${item.item_type === 'certificate' ? 'bg-blue-100 text-blue-800' : item.item_type === 'skill' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}">
                                            ${item.item_type === 'certificate' ? 'Сертификат' : item.item_type === 'skill' ? 'Дағды' : 'Жетістік'}
                                        </span>
                                    </div>
                                    
                                    ${item.description ? `
                                        <p class="text-gray-600 mb-3 text-sm">${item.description}</p>
                                    ` : ''}
                                    
                                    ${item.files && item.files.length > 0 ? `
                                        <div class="mb-3">
                                            <p class="text-xs font-medium text-gray-700 mb-1">Құжаттар:</p>
                                            <div class="space-y-1">
                                                ${item.files.map(file => `
                                                    <div class="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                                        <span class="text-gray-600 truncate">${file.name}</span>
                                                        <div class="flex space-x-1">
                                                            <button onclick="previewFile('${file.data}', '${file.name}')" 
                                                                    class="text-blue-600 hover:text-blue-800 text-xs">
                                                                Ашу
                                                            </button>
                                                            <button onclick="downloadFile('${file.data}', '${file.name}')" 
                                                                    class="text-purple-600 hover:text-purple-800 text-xs">
                                                                Жүктеу
                                                            </button>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                    
                                    <p class="text-xs text-gray-400">
                                        Күні: ${new Date(item.item_date).toLocaleDateString()}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        </div>

        <script>
            // Файлды алдын ала қарау
            function previewFile(dataUrl, filename) {
                const newWindow = window.open();
                if (filename.toLowerCase().endsWith('.pdf')) {
                    newWindow.document.write(\`
                        <html>
                            <head><title>\${filename}</title></head>
                            <body style="margin:0; padding:0; height:100vh;">
                                <iframe src="\${dataUrl}" style="width:100%; height:100vh; border:none;"></iframe>
                            </body>
                        </html>
                    \`);
                } else if (filename.toLowerCase().match(/\\.(jpg|jpeg|png|gif)\$/)) {
                    newWindow.document.write(\`
                        <html>
                            <head><title>\${filename}</title></head>
                            <body style="margin:0; padding:20px; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f3f4f6;">
                                <img src="\${dataUrl}" style="max-width:100%; max-height:90vh; border:1px solid #ddd; border-radius:8px;">
                            </body>
                        </html>
                    \`);
                } else {
                    newWindow.document.write(\`
                        <html>
                            <head><title>\${filename}</title></head>
                            <body style="margin:0; padding:20px; font-family:monospace; white-space:pre-wrap;">
                                \${atob(dataUrl.split(',')[1])}
                            </body>
                        </html>
                    \`);
                }
            }

            // Файлды жүктеу
            function downloadFile(dataUrl, filename) {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // CV жасау және жүктеу
            async function downloadStudentCV(studentId) {
                try {
                    const response = await fetch(\`/api/employer/student/\${studentId}\`);
                    const data = await response.json();

                    const student = data.user;
                    const projects = data.projects;
                    const portfolio = data.portfolio;

                    // CV құрамын жасау
                    const cvContent = \`
CV - \${student.firstname} \${student.lastname}
======================================

ЖЕКЕ АҚПАРАТ:
Аты-жөні: \${student.firstname} \${student.lastname}
Email: \${student.email}
Пайдаланушы аты: @\${student.username}

\${student.bio ? \`Өзі туралы:\\n\${student.bio}\\n\\n\` : ''}

ЖОБАЛАР (\${projects.length}):
\${projects.map(project => \`
• \${project.title} - \${project.category}
  Мәртебесі: \${project.status === 'completed' ? 'Аяқталды' : project.status === 'in-progress' ? 'Орындалуда' : 'Жоспарланған'}
  Сипаттама: \${project.description}
  \${project.skills ? \`Технологиялар: \${project.skills}\` : ''}
  Күні: \${new Date(project.created_at).toLocaleDateString()}
\`).join('\\n')}

ПОРТФОЛИО (\${portfolio.length}):
\${portfolio.map(item => \`
• \${item.title} - \${item.item_type === 'certificate' ? 'Сертификат' : item.item_type === 'skill' ? 'Дағды' : 'Жетістік'}
  Күні: \${new Date(item.item_date).toLocaleDateString()}
  \${item.description ? \`Сипаттама: \${item.description}\` : ''}
\`).join('\\n')}

СТАТИСТИКА:
- Жобалар саны: \${projects.length}
- Портфолио элементтері: \${portfolio.length}
- Профиль көрулері: \${data.analytics.profileViews || 0}

======================================
Жасалған күні: \${new Date().toLocaleDateString()}
Student Portfolio Platform арқылы
                    \`;

                    // Файлды жасау және жүктеу
                    const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = \`CV_\${student.firstname}_\${student.lastname}.txt\`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    alert('CV сәтті жүктелді!');
                } catch (error) {
                    console.error('CV жасау қатесі:', error);
                    alert('CV жасау қатесі');
                }
            }
        </script>
    </body>
    </html>
  `);
});
// Дерек қосу (БІР ЭЛЕМЕНТ)
app.post("/api/:key", (req, res) => {
  const key = req.params.key;
  const body = req.body;
  const data = readJSON(key);

  if (Array.isArray(data)) {
    data.push(body);
    writeJSON(key, data);
  } else {
    writeJSON(key, [body]);
  }

  res.json({ message: "Сәтті сақталды", item: body });
});

// ТОЛЫҚ АУЫСТЫРУ (Replace) - деректерді жоғалтпау үшін
app.post("/api/:key/replace", (req, res) => {
  const key = req.params.key;
  writeJSON(key, req.body);
  res.json({ status: "ok" });
});

// Элемент жою
app.delete("/api/:key/:id", (req, res) => {
  const { key, id } = req.params;
  let data = readJSON(key);

  if (!Array.isArray(data)) return res.status(400).json({ error: "Формат дұрыс емес" });

  data = data.filter(item => item.id !== id);
  writeJSON(key, data);

  res.json({ message: "Жойылды" });
});

// -----------------------------
// ЖҰМЫС БЕРУШІ API
// -----------------------------

// Жұмыс беруші аккаунттарын алу
app.get("/api/employers", (req, res) => {
  const employers = readJSON("employers");
  res.json(employers);
});

// Жұмыс беруші тіркелу
app.post("/api/employers/register", (req, res) => {
  const { email, password, firstname, lastname, company } = req.body;
  const employers = readJSON("employers");

  if (employers.find(e => e.email === email)) {
    return res.status(400).json({ error: "Бұл email бұрын тіркелген" });
  }

  const newEmployer = {
    id: "employer_" + Date.now(),
    email,
    password,
    firstname,
    lastname,
    company,
    created_at: new Date().toISOString()
  };

  employers.push(newEmployer);
  writeJSON("employers", employers);

  res.json({ success: true, employer: newEmployer });
});

// Жұмыс беруші кіру
app.post("/api/employers/login", (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Email және құпиясөз қажет" 
      });
    }

    const employers = readJSON("employers");

    const foundEmployer = employers.find(e => 
      e.email === email && e.password === password
    );

    if (foundEmployer) {
      // currentEmployer файлына жазу
      writeJSON("currentEmployer", { employer: foundEmployer });
      res.json({ 
        success: true, 
        employer: foundEmployer,
        message: "Кіру сәтті!"
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: "Қате email немесе құпиясөз" 
      });
    }
  } catch (error) {
    console.error("Кіру қатесі:", error);
    res.status(500).json({ 
      success: false, 
      error: "Сервер қатесі" 
    });
  }
});

// Ағымдағы жұмыс берушіні алу
app.get("/api/current-employer", (req, res) => {
  const currentEmployer = readJSON("currentEmployer");
  res.json(currentEmployer || null);
});

// Жұмыс беруші шығу
app.post("/api/employers/logout", (req, res) => {
  writeJSON("currentEmployer", null);
  res.json({ success: true });
});

// Барлық студенттерді алу (түрлендірілген)
app.get("/api/employer/students", (req, res) => {
  const users = readJSON("users");
  const projects = readJSON("projects");
  const portfolio = readJSON("portfolio");
  const analytics = readJSON("analytics");

  // Әр студент үшін статистика қосу
  const studentsWithStats = users.map(user => {
    const userProjects = projects.filter(p => p.user_id === user.id);
    const userPortfolio = portfolio.filter(p => p.user_id === user.id);
    const userAnalytics = analytics[user.id] || { profileViews: 0 };

    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      bio: user.bio || "",
      projectsCount: userProjects.length,
      portfolioCount: userPortfolio.length,
      profileViews: userAnalytics.profileViews || 0,
      created_at: user.created_at
    };
  });

  res.json(studentsWithStats);
});

// Нақты студенттің толық деректері (түрлендірілген)
app.get("/api/employer/student/:id", (req, res) => {
  const userId = req.params.id;
  const users = readJSON("users");
  const projects = readJSON("projects");
  const portfolio = readJSON("portfolio");
  const analytics = readJSON("analytics");

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "Студент табылмады" });
  }

  const userProjects = projects.filter(p => p.user_id === userId);
  const userPortfolio = portfolio.filter(p => p.user_id === userId);
  const userAnalytics = analytics[userId] || {
    profileViews: 0,
    projectViews: 0,
    engagementRate: 0
  };

  res.json({
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      bio: user.bio || "",
      created_at: user.created_at
    },
    projects: userProjects,
    portfolio: userPortfolio,
    analytics: userAnalytics
  });
});

// Барлық жобаларды алу
app.get("/api/employer/all-projects", (req, res) => {
  const projects = readJSON("projects");
  res.json(projects);
});

// -----------------------------
// БАРЛЫҚ ДЕРЕКТЕРДІ ЖОЮ
// -----------------------------
app.post("/api/clear-all", (req, res) => {
  writeJSON("users", []);
  writeJSON("projects", []);
  writeJSON("portfolio", []);
  writeJSON("analytics", {});
  writeJSON("currentUser", null);
  writeJSON("employers", []);
  writeJSON("currentEmployer", null);
  res.json({ message: "Барлық деректер жойылды" });
});

// -----------------------------
// АНАЛИТИКА: VIEW TRACKING
// -----------------------------
app.post("/api/track-view", (req, res) => {
  const { userId, page } = req.body;

  let analytics = readJSON("analytics");

  if (!analytics || Array.isArray(analytics)) analytics = {};

  if (!analytics[userId]) {
    analytics[userId] = {
      profileViews: 0,
      projectViews: 0,
      engagementRate: 0,
      viewsHistory: []
    };
  }

  const userData = analytics[userId];

  if (page === "profile" || page === "dashboard") userData.profileViews++;
  if (page === "projects") userData.projectViews++;

  userData.engagementRate = Math.min(100, userData.engagementRate + 1);

  const today = new Date().toISOString().slice(0, 10);
  let day = userData.viewsHistory.find(d => d.date === today);

  if (!day) {
    userData.viewsHistory.push({ date: today, views: 1 });
  } else {
    day.views++;
  }

  writeJSON("analytics", analytics);

  res.json({ status: "ok" });
});

// -----------------------------
// Соңында: Барлық сұраныстарға index.html беру
// -----------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -----------------------------
// Серверді қосу
// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Сервер сәтті қосылды: http://localhost:${PORT}`);
  console.log(`📊 Студент режимі: http://localhost:${PORT}`);
  console.log(`👔 Жұмыс беруші режимі: http://localhost:${PORT}/employer`);
});