// Importy
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Wymagane do komunikacji z Reactem

const app = express();
const PORT = 3001; // Użyj innego portu niż React (zazwyczaj 3000)

// Zezwól na CORS, aby React mógł się komunikować
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Ścieżka, gdzie będą zapisywane dokumenty.
// Użyj katalogu w serwerze, np. 'server/uploaded_documents'
const UPLOAD_DIR = path.join(__dirname, 'uploaded_documents');

// Upewnij się, że katalog istnieje
if (!fs.existsSync(UPLOAD_DIR)){
    fs.mkdirSync(UPLOAD_DIR);
}

// Konfiguracja Multer do obsługi plików
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Zapisz pliki w naszym dedykowanym katalogu
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Nazwa pliku: timestamp_oryginalnanazwa.pdf
        const timestamp = Date.now();
        cb(null, `${timestamp}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// -----------------------------------------------------------
// Endpoint API do przesyłania dokumentów
// Endpoint odpowiada 'UPLOAD_API_ENDPOINT' z App.js ('/api/upload-document')
// -----------------------------------------------------------
app.post('/api/upload-document', upload.single('file'), (req, res) => {
    // `upload.single('file')` przetwarza plik i zapisuje go na dysku

    if (!req.file) {
        return res.status(400).send('Brak pliku do przesłania.');
    }

    // Budujemy ścieżkę, która będzie zapisana w Firestore.
    // Możesz tutaj użyć pełnego URL, ścieżki sieciowej (SMB) lub URL dostępu przez serwer statyczny.
    // Dla testów, zwrócimy ścieżkę relatywną
    const relativeFilePath = `/documents/${req.file.filename}`;

    console.log(`Plik zapisany: ${req.file.path}`);

    // Odpowiedz do Reacta z informacją o powodzeniu i ścieżką
    res.json({
        message: 'Plik przesłany pomyślnie.',
        filePath: relativeFilePath, // Ta ścieżka pójdzie do Firestore jako 'link'
        documentName: req.body.documentName
    });
});

// Opcjonalnie: Udostępnienie katalogu uploaded_documents jako statyczny
app.use('/documents', express.static(UPLOAD_DIR));



// Importy Firebase (jeśli nie są już dodane)
const { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } = require('firebase/firestore');

// Endpointy dla wypożyczeń
app.get('/api/rentals', async (req, res) => {
    try {
        const q = query(collection(db, 'rentals'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const rentals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rentals', async (req, res) => {
    try {
        const { ownerName, renterName, renterDetails, issueDate, returnDate, items, notes } = req.body;
        const rentalNumber = await generateRentalNumber();
        const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const docRef = await addDoc(collection(db, 'rentals'), {
            ownerName,
            renterName,
            renterDetails,
            issueDate,
            returnDate,
            items,
            notes,
            rentalNumber,
            totalValue,
            createdAt: new Date()
        });
        res.json({ id: docRef.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/rentals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await updateDoc(doc(db, 'rentals', id), updates);
        res.json({ message: 'Zaktualizowano' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/rentals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteDoc(doc(db, 'rentals', id));
        res.json({ message: 'Usunięto' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Funkcja pomocnicza do generowania numeru (dodaj na początku pliku)
const generateRentalNumber = async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const q = query(collection(db, 'rentals'), orderBy('rentalNumber', 'desc'));
    const snapshot = await getDocs(q);
    const last = snapshot.docs[0]?.data()?.rentalNumber || `${today}-000`;
    const num = parseInt(last.split('-')[1]) + 1;
    return `${today}-${num.toString().padStart(3, '0')}`;
};



app.listen(PORT, () => {
    console.log(`Serwer backend działa na http://localhost:${PORT}`);
});