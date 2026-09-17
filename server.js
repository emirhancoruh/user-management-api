const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: Gelen isteklerin gövdesini (body) JSON olarak parse eder
app.use(express.json());

// ---------------------------------------------------------
// REQUIREMENT 5: Middleware Uygulaması (Logging Middleware)
// ---------------------------------------------------------
const requestLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} isteği geldi: ${req.url}`);
    next();
};
app.use(requestLogger);

// Basit bellek içi veri tabanı (In-memory data store)
let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// ---------------------------------------------------------
// REQUIREMENT 4: Validasyon (Validation Middleware)
// ---------------------------------------------------------
const validateUser = (req, res, next) => {
    const { name, email } = req.body;
    
    // İsim veya E-posta eksikse/hatalıysa 400 Bad Request döndürür
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Geçerli bir isim (name) girilmesi zorunludur.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Geçerli bir e-posta (email) girilmesi zorunludur.' });
    }
    
    next(); // Validasyon başarılıysa sonraki adıma geç
};

// ---------------------------------------------------------
// REQUIREMENT 2: CRUD Endpoints (GET, POST, PUT, DELETE)
// ---------------------------------------------------------

// GET: Tüm kullanıcıları getir
app.get('/users', (req, res) => {
    res.status(200).json(users);
});

// GET: ID'ye göre tek bir kullanıcı getir
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.status(200).json(user);
});

// POST: Yeni bir kullanıcı oluştur (validateUser ile veriyi doğrular)
app.post('/users', validateUser, (req, res) => {
    const { name, email } = req.body;
    
    // ---------------------------------------------------------
    // REQUIREMENT 3: Copilot Debugging Kanıtı / Kullanımı
    // ---------------------------------------------------------
    // [Copilot Debugging]: Önceden ID atamasında çakışmalar oluyordu. 
    // Copilot, ID atamasını dinamik olarak dizideki en yüksek ID'yi bularak 
    // yapmamı önerdi. Aşağıdaki kod Copilot ile debug edilerek düzeltildi:
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const newUser = { id: newId, name, email };
    users.push(newUser);
    
    res.status(201).json(newUser);
});

// PUT: Mevcut bir kullanıcıyı güncelle (validateUser ile veriyi doğrular)
app.put('/users/:id', validateUser, (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Güncellenecek kullanıcı bulunamadı.' });
    }
    
    const { name, email } = req.body;
    users[userIndex] = { id: userId, name, email };
    
    res.status(200).json(users[userIndex]);
});

// DELETE: Bir kullanıcıyı sil
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Silinecek kullanıcı bulunamadı.' });
    }
    
    // Kullanıcıyı diziden çıkar
    users.splice(userIndex, 1);
    res.status(204).send(); // 204 No Content (Başarılı, içerik dönmez)
});

// Bilinmeyen hataları yakalayan Global Hata Middleware'i
app.use((err, req, res, next) => {
    console.error('Sunucu Hatası:', err.message);
    res.status(500).json({ error: 'Sunucuda beklenmeyen bir hata oluştu.' });
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda başarıyla çalışıyor.`);
});

