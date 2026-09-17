const express = require('express');
const app = express();

app.use(express.json()); // JSON verilerini ayrıştırmak için gerekli middleware

// -----------------------------------------------------
// 1. GEREKSİNİM: Middleware (Ara Katman) - Günlükleme (Logging)
// -----------------------------------------------------
// Gelen her HTTP isteğini (GET, POST vb.) konsola yazdırır.
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    next();
});

// Geçici veri tabanı (Kullanıcı listesi)
let users = [
    { id: 1, name: "Ahmet Yılmaz", email: "ahmet@example.com" },
    { id: 2, name: "Ayşe Demir", email: "ayse@example.com" }
];

// -----------------------------------------------------
// 2. GEREKSİNİM: Doğrulama (Validation)
// -----------------------------------------------------
// Yeni kullanıcı eklerken veya güncellerken verinin geçerli olup olmadığını kontrol eder.
const validateUser = (req, res, next) => {
    const { name, email } = req.body;
    
    // İsim (name) kontrolü
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Geçerli bir isim (name) girilmelidir." });
    }
    
    // E-posta (email) kontrolü
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Geçerli bir e-posta (email) girilmelidir." });
    }
    
    next(); // Eğer doğrulama başarılıysa işlemi devam ettir (CRUD'a geç)
};

// -----------------------------------------------------
// 3. GEREKSİNİM: CRUD İşlemleri (GET, POST, PUT, DELETE)
// -----------------------------------------------------

// READ (GET) - Tüm kullanıcıları getir
app.get('/users', (req, res) => {
    res.status(200).json(users);
});

// READ (GET) - Belirli bir kullanıcıyı ID ile getir
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    res.status(200).json(user);
});

// CREATE (POST) - Yeni kullanıcı ekle (Validation uygulanır)
app.post('/users', validateUser, (req, res) => {
    const newUser = {
        // Otomatik ID atama
        id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
        name: req.body.name,
        email: req.body.email
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// UPDATE (PUT) - Kullanıcıyı güncelle (Validation uygulanır)
app.put('/users/:id', validateUser, (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    user.name = req.body.name;
    user.email = req.body.email;
    res.status(200).json(user);
});

// DELETE (DELETE) - Kullanıcı sil
app.delete('/users/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const deletedUser = users.splice(userIndex, 1);
    res.status(200).json({ message: "Kullanıcı başarıyla silindi.", user: deletedUser });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda başarıyla çalışıyor...`);
});
