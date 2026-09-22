const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use('/uploads', express.static('uploads'));

const DATA_FILE = path.join(__dirname, '../data/users.json');

// ============ CONFIGURAÇÃO DE UPLOAD DE FOTOS ============
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (types.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'));
        }
    }
});

// ============ FUNÇÕES DE BANCO DE DADOS ============
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            const parsed = JSON.parse(data);
            if (!parsed.users) parsed.users = [];
            if (!parsed.groups) parsed.groups = [];
            if (!parsed.battles) parsed.battles = [];
            if (!parsed.feed) parsed.feed = [];
            if (!parsed.messages) parsed.messages = [];
            if (!parsed.friends) parsed.friends = [];
            if (!parsed.achievements) parsed.achievements = [];
            if (!parsed.challenges) parsed.challenges = [];
            if (!parsed.calendar) parsed.calendar = [];
            if (!parsed.goals) parsed.goals = [];
            if (!parsed.shop) parsed.shop = [];
            if (!parsed.studyTips) parsed.studyTips = [];
            if (!parsed.studyLogs) parsed.studyLogs = [];
            if (!parsed.streaks) parsed.streaks = [];
            return parsed;
        }
    } catch (error) {
        console.error('Erro ao ler arquivo:', error);
    }
    
    const initialData = { 
        users: [], 
        groups: [], 
        battles: [], 
        feed: [],
        messages: [],
        friends: [],
        achievements: [],
        challenges: [],
        calendar: [],
        goals: [],
        shop: [],
        studyTips: [],
        studyLogs: [],
        streaks: []
    };
    
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function findUser(data, userId) {
    return data.users.find(u => u.id === userId);
}

function findGroup(data, groupId) {
    return data.groups.find(g => g.id === groupId);
}

// ============ SISTEMA DE CONQUISTAS ============
const ACHIEVEMENTS = [
    { id: 'first_login', name: '🎯 Primeiro Dia', description: 'Fez login pela primeira vez', icon: '🎯', points: 5 },
    { id: 'daily_streak_7', name: '🔥 Semana de Fogo', description: 'Login por 7 dias seguidos', icon: '🔥', points: 20 },
    { id: 'points_50', name: '⭐ Iniciante', description: 'Alcançou 50 pontos', icon: '⭐', points: 10 },
    { id: 'points_100', name: '🌟 Mestre', description: 'Alcançou 100 pontos', icon: '🌟', points: 20 },
    { id: 'groups_5', name: '👥 Social', description: 'Entrou em 5 grupos', icon: '👥', points: 15 },
    { id: 'battle_win', name: '🏆 Campeão', description: 'Venceu uma batalha', icon: '🏆', points: 25 },
    { id: 'games_10', name: '🎮 Gamer', description: 'Jogou 10 partidas', icon: '🎮', points: 15 },
    { id: 'study_10h', name: '📚 Estudioso', description: 'Estudou 10 horas', icon: '📚', points: 30 },
    { id: 'streak_30', name: '👑 Lenda', description: '30 dias de streak', icon: '👑', points: 50 },
    { id: 'streak_100', name: '💎 Mestre dos Mestres', description: '100 dias de streak', icon: '💎', points: 100 }
];

// ============ DICAS DE ESTUDO ============
const STUDY_TIPS = [
    { id: 1, category: 'Foco', tip: '🧠 Use a técnica Pomodoro: 25min de estudo, 5min de pausa.', expert: 'Francesco Cirillo' },
    { id: 2, category: 'Memória', tip: '📝 Revise o conteúdo em intervalos regulares (1 dia, 3 dias, 1 semana).', expert: 'Hermann Ebbinghaus' },
    { id: 3, category: 'Organização', tip: '📚 Crie um ambiente de estudo organizado e livre de distrações.', expert: 'Barbara Oakley' },
    { id: 4, category: 'Saúde', tip: '💤 Durma 7-8 horas por noite. O sono é essencial para consolidar a memória.', expert: 'Matthew Walker' },
    { id: 5, category: 'Ativo', tip: '✍️ Ensine o conteúdo para outra pessoa. Ensinar é a melhor forma de aprender.', expert: 'Richard Feynman' },
    { id: 6, category: 'Estratégia', tip: '🎯 Defina metas específicas e mensuráveis.', expert: 'Peter Drucker' },
    { id: 7, category: 'Motivação', tip: '🏆 Recompense-se após completar suas metas de estudo.', expert: 'Daniel Pink' },
    { id: 8, category: 'Prática', tip: '📖 Faça exercícios e testes práticos. A prática ativa é mais eficaz.', expert: 'Robert Bjork' },
    { id: 9, category: 'Mentalidade', tip: '💪 Adote uma mentalidade de crescimento.', expert: 'Carol Dweck' },
    { id: 10, category: 'Visual', tip: '🎨 Use mapas mentais e diagramas para organizar informações.', expert: 'Tony Buzan' },
    { id: 11, category: 'Colaborativo', tip: '👥 Forme grupos de estudo para discutir os conteúdos.', expert: 'Lev Vygotsky' },
    { id: 12, category: 'Metacognição', tip: '🤔 Reflita sobre como você aprende melhor.', expert: 'John Flavell' }
];

// ============ FUNÇÕES AUXILIARES ============
function getLevel(points) {
    if (points < 50) return { level: 1, name: '🌱 Iniciante' };
    if (points < 100) return { level: 2, name: '📖 Estudante' };
    if (points < 200) return { level: 3, name: '📚 Dedicado' };
    if (points < 400) return { level: 4, name: '🎓 Sábio' };
    return { level: 5, name: '👑 Mestre' };
}

function checkAchievements(data, userId) {
    const user = findUser(data, userId);
    if (!user) return;
    if (!user.achievements) user.achievements = [];
    
    ACHIEVEMENTS.forEach(ach => {
        if (user.achievements.includes(ach.id)) return;
        let unlocked = false;
        switch(ach.id) {
            case 'first_login': unlocked = true; break;
            case 'points_50': unlocked = user.points >= 50; break;
            case 'points_100': unlocked = user.points >= 100; break;
            case 'groups_5': unlocked = (user.groups?.length || 0) >= 5; break;
            case 'battle_win': unlocked = (user.battlesWon || 0) >= 1; break;
            case 'games_10': unlocked = (user.gamesPlayed || 0) >= 10; break;
            case 'study_10h': unlocked = (user.studyHours || 0) >= 10; break;
            case 'daily_streak_7': unlocked = (user.streakDays || 0) >= 7; break;
            case 'streak_30': unlocked = (user.streakDays || 0) >= 30; break;
            case 'streak_100': unlocked = (user.streakDays || 0) >= 100; break;
        }
        if (unlocked) {
            user.achievements.push(ach.id);
            user.points += ach.points;
            data.feed.unshift({
                id: Date.now(),
                userId: user.id,
                username: user.username,
                action: `desbloqueou a conquista "${ach.name}"`,
                points: ach.points,
                time: new Date().toISOString()
            });
            saveData(data);
        }
    });
}

// ============ ROTAS ============

// CADASTRO
app.post('/api/register', (req, res) => {
    const data = loadData();
    const { username, fullName, school, grade, bio, favoriteSubjects } = req.body;
    
    if (!username || !fullName || !school || !grade) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }
    
    if (data.users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Nome de usuário já existe!' });
    }
    
    const newUser = {
        id: Date.now(),
        username: username.toLowerCase(),
        fullName,
        school,
        grade,
        bio: bio || '',
        favoriteSubjects: favoriteSubjects || [],
        points: 0,
        groups: [],
        friends: [],
        dailyLogin: false,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        battlesWon: 0,
        gamesPlayed: 0,
        studyHours: 0,
        achievements: [],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=667eea&color=fff&size=200`,
        darkMode: false,
        streakDays: 0,
        lastStreakDate: null,
        studyLogs: [],
        studyLogsHistory: [],
        settings: { notifications: true, sound: true }
    };
    
    data.users.push(newUser);
    saveData(data);
    checkAchievements(data, newUser.id);
    res.json({ success: true, user: newUser, message: 'Cadastro realizado com sucesso!' });
});

// LOGIN
app.post('/api/login', (req, res) => {
    const data = loadData();
    const { username } = req.body;
    
    if (!username) {
        return res.status(400).json({ error: 'Digite seu nome de usuário!' });
    }
    
    const user = data.users.find(u => u.username === username.toLowerCase());
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
    }
    
    const today = new Date().toDateString();
    let dailyBonus = 0;
    
    if (user.lastLogin !== today) {
        user.points += 5;
        user.lastLogin = today;
        user.dailyLogin = true;
        dailyBonus = 5;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (user.lastStreakDate === yesterdayStr) {
            user.streakDays = (user.streakDays || 0) + 1;
        } else if (user.lastStreakDate !== today) {
            user.streakDays = 1;
        }
        user.lastStreakDate = today;
        
        if (user.streakDays === 7 || user.streakDays === 30 || user.streakDays === 100) {
            const achId = user.streakDays === 7 ? 'daily_streak_7' : user.streakDays === 30 ? 'streak_30' : 'streak_100';
            const achievement = ACHIEVEMENTS.find(a => a.id === achId);
            if (achievement && !user.achievements.includes(achievement.id)) {
                user.achievements.push(achievement.id);
                user.points += achievement.points;
                data.feed.unshift({
                    id: Date.now(),
                    userId: user.id,
                    username: user.username,
                    action: `desbloqueou a conquista "${achievement.name}" (Streak: ${user.streakDays} dias)`,
                    points: achievement.points,
                    time: new Date().toISOString()
                });
            }
        }
        
        saveData(data);
        data.feed.unshift({
            id: Date.now(),
            userId: user.id,
            username: user.username,
            action: `fez login diário (🔥 ${user.streakDays} dias seguidos)`,
            points: 5,
            time: new Date().toISOString()
        });
        saveData(data);
    }
    
    checkAchievements(data, user.id);
    const updatedUser = findUser(data, user.id);
    
    res.json({ 
        success: true, 
        user: updatedUser,
        dailyBonus,
        streakDays: updatedUser.streakDays || 0,
        message: dailyBonus > 0 ? `Login realizado! +5pts (🔥 ${updatedUser.streakDays} dias)` : 'Bem-vindo de volta!'
    });
});

// UPLOAD DE FOTO
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
    console.log('📸 Upload de foto recebido!');
    
    const data = loadData();
    const { userId } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada!' });
    }
    
    const user = findUser(data, parseInt(userId));
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
    }
    
    const avatarUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    user.avatar = avatarUrl;
    saveData(data);
    
    res.json({ success: true, avatarUrl, message: 'Foto de perfil atualizada!' });
});

// CRIAR GRUPO
app.post('/api/groups', (req, res) => {
    const data = loadData();
    const { name, subject, description, creatorId } = req.body;
    
    if (!name || !subject || !creatorId) {
        return res.status(400).json({ error: 'Nome, matéria e criador são obrigatórios!' });
    }
    
    const creator = findUser(data, creatorId);
    if (!creator) {
        return res.status(404).json({ error: 'Criador não encontrado!' });
    }
    
    const group = {
        id: Date.now(),
        name,
        subject,
        description: description || `Grupo de estudo de ${subject}`,
        creatorId,
        code: generateCode(),
        members: [creatorId],
        createdAt: new Date().toISOString(),
        totalBattles: 0
    };
    
    data.groups.push(group);
    creator.points += 5;
    if (!creator.groups) creator.groups = [];
    creator.groups.push(group.id);
    
    data.feed.unshift({
        id: Date.now(),
        userId: creator.id,
        username: creator.username,
        action: `criou o grupo "${name}"`,
        points: 5,
        time: new Date().toISOString()
    });
    
    saveData(data);
    res.json({ success: true, group, message: 'Grupo criado com sucesso!' });
});

// ENTRAR EM GRUPO
app.post('/api/groups/join', (req, res) => {
    const data = loadData();
    const { code, userId } = req.body;
    
    if (!code || !userId) {
        return res.status(400).json({ error: 'Código e usuário são obrigatórios!' });
    }
    
    const group = data.groups.find(g => g.code === code.toUpperCase());
    if (!group) {
        return res.status(404).json({ error: 'Código inválido!' });
    }
    
    const user = findUser(data, userId);
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
    }
    
    if (user.groups && user.groups.includes(group.id)) {
        return res.status(400).json({ error: 'Você já está neste grupo!' });
    }
    
    if (!user.groups) user.groups = [];
    user.groups.push(group.id);
    user.points += 5;
    group.members.push(userId);
    
    data.feed.unshift({
        id: Date.now(),
        userId: user.id,
        username: user.username,
        action: `entrou no grupo "${group.name}"`,
        points: 5,
        time: new Date().toISOString()
    });
    
    if (user.groups.length >= 5) {
        const achievement = ACHIEVEMENTS.find(a => a.id === 'groups_5');
        if (achievement && !user.achievements.includes(achievement.id)) {
            user.achievements.push(achievement.id);
            user.points += achievement.points;
            data.feed.unshift({
                id: Date.now(),
                userId: user.id,
                username: user.username,
                action: `desbloqueou a conquista "${achievement.name}"`,
                points: achievement.points,
                time: new Date().toISOString()
            });
        }
    }
    
    saveData(data);
    res.json({ success: true, group, message: 'Entrou no grupo com sucesso!' });
});

// SAIR DO GRUPO
app.post('/api/groups/leave', (req, res) => {
    const data = loadData();
    const { groupId, userId } = req.body;
    
    if (!groupId || !userId) {
        return res.status(400).json({ error: 'Dados incompletos!' });
    }
    
    const group = findGroup(data, groupId);
    if (!group) {
        return res.status(404).json({ error: 'Grupo não encontrado!' });
    }
    
    const user = findUser(data, userId);
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
    }
    
    // Remover usuário do grupo
    group.members = group.members.filter(id => id !== userId);
    user.groups = user.groups.filter(id => id !== groupId);
    
    saveData(data);
    res.json({ success: true, message: 'Você saiu do grupo!' });
});

// LISTAR GRUPOS DO USUÁRIO
app.get('/api/users/:userId/groups', (req, res) => {
    const data = loadData();
    const userId = parseInt(req.params.userId);
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    const userGroups = data.groups.filter(g => user.groups && user.groups.includes(g.id));
    res.json(userGroups);
});

// RANKINGS
app.get('/api/rankings/national', (req, res) => {
    const data = loadData();
    const ranked = data.users.map(u => ({
        id: u.id, username: u.username, fullName: u.fullName,
        points: u.points, school: u.school, grade: u.grade,
        avatar: u.avatar, level: getLevel(u.points), streakDays: u.streakDays || 0
    })).sort((a, b) => b.points - a.points);
    res.json(ranked);
});

app.get('/api/rankings/school', (req, res) => {
    const data = loadData();
    const { school } = req.query;
    if (!school) return res.status(400).json({ error: 'Nome da escola é obrigatório!' });
    const ranked = data.users.filter(u => u.school.toLowerCase() === school.toLowerCase())
        .map(u => ({
            id: u.id, username: u.username, fullName: u.fullName,
            points: u.points, grade: u.grade, avatar: u.avatar,
            level: getLevel(u.points), streakDays: u.streakDays || 0
        })).sort((a, b) => b.points - a.points);
    res.json(ranked);
});

app.get('/api/groups/:groupId/ranking', (req, res) => {
    const data = loadData();
    const groupId = parseInt(req.params.groupId);
    const group = findGroup(data, groupId);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado!' });
    const members = data.users.filter(u => group.members.includes(u.id))
        .map(u => ({
            id: u.id, username: u.username, fullName: u.fullName,
            points: u.points, school: u.school, avatar: u.avatar,
            level: getLevel(u.points), streakDays: u.streakDays || 0
        })).sort((a, b) => b.points - a.points);
    res.json(members);
});

app.get('/api/rankings/provincial', (req, res) => {
    const data = loadData();
    const schoolRanking = {};
    data.users.forEach(u => {
        if (!schoolRanking[u.school]) {
            schoolRanking[u.school] = { school: u.school, totalPoints: 0, students: 0, topStudent: null };
        }
        schoolRanking[u.school].totalPoints += u.points;
        schoolRanking[u.school].students += 1;
        if (!schoolRanking[u.school].topStudent || u.points > schoolRanking[u.school].topStudent.points) {
            schoolRanking[u.school].topStudent = { username: u.username, points: u.points };
        }
    });
    const ranked = Object.values(schoolRanking).sort((a, b) => b.totalPoints - a.totalPoints);
    res.json(ranked);
});

// BATALHA
app.post('/api/battle', (req, res) => {
    const data = loadData();
    const { groupId, results, battleName, creatorId } = req.body;
    if (!groupId || !results || !Array.isArray(results) || results.length === 0) {
        return res.status(400).json({ error: 'Dados da batalha incompletos!' });
    }
    const group = findGroup(data, groupId);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado!' });
    const sorted = [...results].sort((a, b) => b.score - a.score);
    const pointsDistribution = [30, 20, 10];
    const battleResults = sorted.map((result, index) => {
        const user = findUser(data, result.userId);
        let pointsEarned = 0;
        if (user && index < 3) {
            pointsEarned = pointsDistribution[index];
            user.points += pointsEarned;
            if (index === 0) {
                user.battlesWon = (user.battlesWon || 0) + 1;
                const achievement = ACHIEVEMENTS.find(a => a.id === 'battle_win');
                if (achievement && !user.achievements.includes(achievement.id)) {
                    user.achievements.push(achievement.id);
                    user.points += achievement.points;
                    data.feed.unshift({
                        id: Date.now(),
                        userId: user.id,
                        username: user.username,
                        action: `desbloqueou a conquista "${achievement.name}"`,
                        points: achievement.points,
                        time: new Date().toISOString()
                    });
                }
            }
            data.feed.unshift({
                id: Date.now(),
                userId: user.id,
                username: user.username,
                action: `${index === 0 ? '🏆 venceu' : index === 1 ? '🥈 ficou em 2º' : '🥉 ficou em 3º'} na batalha "${battleName || 'Batalha de Conhecimento'}"`,
                points: pointsEarned,
                time: new Date().toISOString()
            });
        }
        return { ...result, position: index + 1, pointsEarned };
    });
    const battle = {
        id: Date.now(),
        groupId,
        battleName: battleName || 'Batalha de Conhecimento',
        creatorId: creatorId || group.creatorId,
        date: new Date().toISOString(),
        results: battleResults
    };
    if (!data.battles) data.battles = [];
    data.battles.push(battle);
    group.totalBattles = (group.totalBattles || 0) + 1;
    saveData(data);
    res.json({ success: true, battle, message: 'Batalha finalizada com sucesso!' });
});

// JOGOS
app.post('/api/game/score', (req, res) => {
    const data = loadData();
    const { userId, gamePoints, gameName } = req.body;
    if (!userId || gamePoints === undefined) return res.status(400).json({ error: 'Dados incompletos!' });
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    user.points += gamePoints;
    user.gamesPlayed = (user.gamesPlayed || 0) + 1;
    if (user.gamesPlayed >= 10) {
        const achievement = ACHIEVEMENTS.find(a => a.id === 'games_10');
        if (achievement && !user.achievements.includes(achievement.id)) {
            user.achievements.push(achievement.id);
            user.points += achievement.points;
            data.feed.unshift({
                id: Date.now(),
                userId: user.id,
                username: user.username,
                action: `desbloqueou a conquista "${achievement.name}"`,
                points: achievement.points,
                time: new Date().toISOString()
            });
        }
    }
    data.feed.unshift({
        id: Date.now(),
        userId: user.id,
        username: user.username,
        action: `jogou "${gameName || 'Jogo Educativo'}"`,
        points: gamePoints,
        time: new Date().toISOString()
    });
    saveData(data);
    res.json({ success: true, newPoints: user.points, message: `+${gamePoints}pts em ${gameName || 'jogo'}` });
});

// CHAMADA
app.post('/api/call/end', (req, res) => {
    const data = loadData();
    const { userId, duration, callType } = req.body;
    if (!userId || duration === undefined) return res.status(400).json({ error: 'Dados incompletos!' });
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    const hours = duration / 60;
    const pointsEarned = Math.floor(hours) * 20;
    if (pointsEarned > 0) {
        user.points += pointsEarned;
        user.studyHours = (user.studyHours || 0) + hours;
        if (!user.studyLogs) user.studyLogs = [];
        user.studyLogs.push({
            id: Date.now(),
            date: new Date().toISOString(),
            duration: Math.floor(hours * 60),
            callType: callType || 'estudo',
            pointsEarned
        });
        if (user.studyHours >= 10) {
            const achievement = ACHIEVEMENTS.find(a => a.id === 'study_10h');
            if (achievement && !user.achievements.includes(achievement.id)) {
                user.achievements.push(achievement.id);
                user.points += achievement.points;
                data.feed.unshift({
                    id: Date.now(),
                    userId: user.id,
                    username: user.username,
                    action: `desbloqueou a conquista "${achievement.name}"`,
                    points: achievement.points,
                    time: new Date().toISOString()
                });
            }
        }
        data.feed.unshift({
            id: Date.now(),
            userId: user.id,
            username: user.username,
            action: `estudou ${Math.floor(hours)}h em chamada de ${callType || 'estudo'}`,
            points: pointsEarned,
            time: new Date().toISOString()
        });
        saveData(data);
    }
    res.json({ success: true, pointsEarned, totalPoints: user.points, studyHours: user.studyHours });
});

// FEED
app.get('/api/feed', (req, res) => {
    const data = loadData();
    const feed = data.feed || [];
    res.json(feed.slice(0, 50));
});

// USUÁRIO POR ID
app.get('/api/users/:userId', (req, res) => {
    const data = loadData();
    const userId = parseInt(req.params.userId);
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    const userData = { ...user, level: getLevel(user.points), achievements: user.achievements || [], totalAchievements: ACHIEVEMENTS.length, streakDays: user.streakDays || 0 };
    res.json(userData);
});

// GRUPO POR ID
app.get('/api/groups/:groupId', (req, res) => {
    const data = loadData();
    const groupId = parseInt(req.params.groupId);
    const group = findGroup(data, groupId);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado!' });
    res.json(group);
});

// AMIGOS
app.post('/api/friends/add', (req, res) => {
    const data = loadData();
    const { userId, friendId } = req.body;
    if (!userId || !friendId) return res.status(400).json({ error: 'Usuários são obrigatórios!' });
    if (userId === friendId) return res.status(400).json({ error: 'Não pode adicionar a si mesmo!' });
    const user = findUser(data, userId);
    const friend = findUser(data, friendId);
    if (!user || !friend) return res.status(404).json({ error: 'Usuário não encontrado!' });
    if (!user.friends) user.friends = [];
    if (!friend.friends) friend.friends = [];
    if (user.friends.includes(friendId)) return res.status(400).json({ error: 'Já são amigos!' });
    user.friends.push(friendId);
    friend.friends.push(userId);
    data.feed.unshift({
        id: Date.now(),
        userId: user.id,
        username: user.username,
        action: `se tornou amigo de ${friend.fullName}`,
        points: 0,
        time: new Date().toISOString()
    });
    saveData(data);
    res.json({ success: true, message: `Agora você é amigo de ${friend.fullName}!` });
});

app.post('/api/friends/remove', (req, res) => {
    const data = loadData();
    const { userId, friendId } = req.body;
    const user = findUser(data, userId);
    const friend = findUser(data, friendId);
    if (!user || !friend) return res.status(404).json({ error: 'Usuário não encontrado!' });
    if (user.friends) user.friends = user.friends.filter(id => id !== friendId);
    if (friend.friends) friend.friends = friend.friends.filter(id => id !== userId);
    saveData(data);
    res.json({ success: true, message: 'Amigo removido com sucesso!' });
});

app.get('/api/users/:userId/friends', (req, res) => {
    const data = loadData();
    const userId = parseInt(req.params.userId);
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    const friends = data.users.filter(u => user.friends && user.friends.includes(u.id));
    res.json(friends);
});

// CONQUISTAS
app.get('/api/achievements', (req, res) => res.json(ACHIEVEMENTS));
app.get('/api/users/:userId/achievements', (req, res) => {
    const data = loadData();
    const userId = parseInt(req.params.userId);
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    const userAchievements = ACHIEVEMENTS.map(a => ({ ...a, unlocked: user.achievements && user.achievements.includes(a.id) }));
    res.json(userAchievements);
});

// DESAFIOS
app.get('/api/challenges/daily', (req, res) => {
    const data = loadData();
    const today = new Date().toDateString();
    let dailyChallenges = data.challenges?.filter(c => c.date === today) || [];
    if (dailyChallenges.length === 0) {
        const challenges = [
            { id: 'ch1', name: '📚 Estudar 1h', description: 'Estude por 1 hora', points: 20, icon: '📚' },
            { id: 'ch2', name: '👥 Convidar um amigo', description: 'Convide um amigo para o GRWM', points: 15, icon: '👥' },
            { id: 'ch3', name: '🎮 Jogar 3 partidas', description: 'Jogue 3 partidas educativas', points: 25, icon: '🎮' }
        ];
        dailyChallenges = challenges.map(c => ({ ...c, date: today, completed: false, progress: 0 }));
        if (!data.challenges) data.challenges = [];
        data.challenges.push(...dailyChallenges);
        saveData(data);
    }
    res.json(dailyChallenges);
});

app.post('/api/challenges/complete', (req, res) => {
    const data = loadData();
    const { userId, challengeId } = req.body;
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    const challenge = data.challenges?.find(c => c.id === challengeId);
    if (!challenge) return res.status(404).json({ error: 'Desafio não encontrado!' });
    if (challenge.completed) return res.status(400).json({ error: 'Desafio já completado!' });
    challenge.completed = true;
    user.points += challenge.points;
    data.feed.unshift({
        id: Date.now(),
        userId: user.id,
        username: user.username,
        action: `completou o desafio "${challenge.name}"`,
        points: challenge.points,
        time: new Date().toISOString()
    });
    saveData(data);
    res.json({ success: true, message: `Desafio completado! +${challenge.points}pts`, challenge });
});

// CALENDÁRIO
app.post('/api/calendar/mark', (req, res) => {
    const data = loadData();
    const { userId, date } = req.body;
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    if (!data.calendar) data.calendar = [];
    const existing = data.calendar.find(c => c.userId === userId && c.date === date);
    if (!existing) { data.calendar.push({ userId, date, studied: true }); saveData(data); }
    res.json({ success: true });
});

app.get('/api/calendar/:userId', (req, res) => {
    const data = loadData();
    const userId = parseInt(req.params.userId);
    const calendar = data.calendar?.filter(c => c.userId === userId) || [];
    res.json(calendar);
});

// METAS
app.post('/api/goals/create', (req, res) => {
    const data = loadData();
    const { userId, title, description, target, deadline } = req.body;
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    if (!data.goals) data.goals = [];
    const goal = {
        id: Date.now(),
        userId,
        title,
        description,
        target,
        progress: 0,
        deadline,
        createdAt: new Date().toISOString(),
        completed: false
    };
    data.goals.push(goal);
    saveData(data);
    res.json({ success: true, goal });
});

app.post('/api/goals/update', (req, res) => {
    const data = loadData();
    const { goalId, progress } = req.body;
    const goal = data.goals?.find(g => g.id === goalId);
    if (!goal) return res.status(404).json({ error: 'Meta não encontrada!' });
    goal.progress = Math.min(goal.progress + progress, goal.target);
    if (goal.progress >= goal.target) {
        goal.completed = true;
        const user = findUser(data, goal.userId);
        if (user) {
            user.points += 10;
            data.feed.unshift({
                id: Date.now(),
                userId: user.id,
                username: user.username,
                action: `completou a meta "${goal.title}"`,
                points: 10,
                time: new Date().toISOString()
            });
        }
    }
    saveData(data);
    res.json({ success: true, goal });
});

app.get('/api/goals/:userId', (req, res) => {
    const data = loadData();
    const userId = parseInt(req.params.userId);
    const goals = data.goals?.filter(g => g.userId === userId) || [];
    res.json(goals);
});

// LOJA
app.get('/api/shop/items', (req, res) => {
    const shopItems = [
        { id: 'item1', name: '🎓 Certificado', description: 'Certificado de conclusão', price: 100, icon: '🎓' },
        { id: 'item2', name: '📖 Livro Digital', description: 'E-book exclusivo', price: 50, icon: '📖' },
        { id: 'item3', name: '🌟 Badge Especial', description: 'Badge exclusivo no perfil', price: 75, icon: '🌟' },
        { id: 'item4', name: '🎁 Sessão de Mentoria', description: '1h com um mentor', price: 200, icon: '🎁' }
    ];
    res.json(shopItems);
});

app.post('/api/shop/buy', (req, res) => {
    const data = loadData();
    const { userId, itemId } = req.body;
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    const shopItems = [
        { id: 'item1', name: '🎓 Certificado', price: 100 },
        { id: 'item2', name: '📖 Livro Digital', price: 50 },
        { id: 'item3', name: '🌟 Badge Especial', price: 75 },
        { id: 'item4', name: '🎁 Sessão de Mentoria', price: 200 }
    ];
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Item não encontrado!' });
    if (user.points < item.price) return res.status(400).json({ error: 'Pontos insuficientes!' });
    user.points -= item.price;
    if (!user.shop) user.shop = [];
    user.shop.push({ itemId: item.id, itemName: item.name, purchasedAt: new Date().toISOString() });
    saveData(data);
    res.json({ success: true, message: `Compra realizada! ${item.name}`, remainingPoints: user.points });
});

// DICAS DE ESTUDO
app.get('/api/study-tips', (req, res) => res.json(STUDY_TIPS));
app.get('/api/study-tips/:category', (req, res) => {
    const { category } = req.params;
    const filtered = STUDY_TIPS.filter(t => t.category.toLowerCase() === category.toLowerCase());
    res.json(filtered);
});

// LOGS DE ESTUDO
app.get('/api/study-logs/:userId', (req, res) => {
    const data = loadData();
    const userId = parseInt(req.params.userId);
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    res.json(user.studyLogs || []);
});

app.post('/api/study-logs/clear', (req, res) => {
    const data = loadData();
    const { userId } = req.body;
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    if (!user.studyLogsHistory) user.studyLogsHistory = [];
    if (user.studyLogs) {
        user.studyLogsHistory.push(...user.studyLogs);
    }
    user.studyLogs = [];
    saveData(data);
    res.json({ success: true, message: 'Logs apagados! Histórico mantido.', historyCount: user.studyLogsHistory.length });
});

app.get('/api/study-logs/history/:userId', (req, res) => {
    const data = loadData();
    const userId = parseInt(req.params.userId);
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    res.json(user.studyLogsHistory || []);
});

// STREAK
app.get('/api/streak/:userId', (req, res) => {
    const data = loadData();
    const userId = parseInt(req.params.userId);
    const user = findUser(data, userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    const streakData = {
        currentStreak: user.streakDays || 0,
        lastStreakDate: user.lastStreakDate,
        bestStreak: user.bestStreak || 0
    };
    if (user.lastStreakDate) {
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        if (user.lastStreakDate !== today && user.lastStreakDate !== yesterdayStr) {
            if (user.streakDays > (user.bestStreak || 0)) {
                user.bestStreak = user.streakDays;
            }
            user.streakDays = 0;
            saveData(data);
            streakData.currentStreak = 0;
            streakData.bestStreak = user.bestStreak || 0;
        }
    }
    res.json(streakData);
});

// ============ INICIAR SERVIDOR ============
server.listen(PORT, () => {
    console.log('\n✅ ========================================');
    console.log('   📚 GRWM - Get Ready With Me v3.0');
    console.log('   🚀 Servidor rodando na porta ' + PORT);
    console.log('   🌐 http://localhost:' + PORT);
    console.log('   ✨ Todas as funcionalidades ativas!');
    console.log('   📸 Upload de fotos: /uploads/');
    console.log('   📖 Dicas de estudo: /api/study-tips');
    console.log('   🔥 Streaks ativos!');
    console.log('========================================\n');
});