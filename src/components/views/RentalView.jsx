import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const RentalView = () => {
    const [rentals, setRentals] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        ownerName: '',
        renterName: '',
        renterDetails: '',
        issueDate: '',
        returnDate: '',
        items: [{ name: '', quantity: 1, category: '', price: 0 }],
        notes: ''
    });

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        const q = query(collection(db, 'rentals'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setRentals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalValue = form.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        await addDoc(collection(db, 'rentals'), {
            ...form,
            totalValue,
            createdAt: new Date()
        });
        setShowModal(false);
        setForm({
            ownerName: '',
            renterName: '',
            renterDetails: '',
            issueDate: '',
            returnDate: '',
            items: [{ name: '', quantity: 1, category: '', price: 0 }],
            notes: ''
        });
        fetchRentals();
    };

    const addItem = () => {
        setForm({ ...form, items: [...form.items, { name: '', quantity: 1, category: '', price: 0 }] });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...form.items];
        newItems[index][field] = value;
        setForm({ ...form, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: newItems });
    };

    const generatePDF = (rental) => {
        const doc = new jsPDF();
        doc.text(`Raport wypożyczenia sprzętu ${rental.rentalNumber}`, 20, 20);
        doc.text(`Właściciel: ${rental.ownerName}`, 20, 40);
        doc.text(`Wypożyczający: ${rental.renterName} - ${rental.renterDetails}`, 20, 50);
        doc.text(`Data wydania: ${rental.issueDate}`, 20, 60);
        doc.text(`Przewidywana data zwrotu: ${rental.returnDate}`, 20, 70);

        const tableData = rental.items.map((item, index) => [
            index + 1,
            item.name,
            item.quantity,
            item.category,
            item.price.toFixed(2)
        ]);
        doc.autoTable({
            head: [['Lp.', 'Nazwa', 'Ilość', 'Kategoria', 'Cena']],
            body: tableData,
            startY: 80
        });

        doc.text(`Suma wartości: ${rental.totalValue.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
        if (rental.notes) doc.text(`Notatki: ${rental.notes}`, 20, doc.lastAutoTable.finalY + 20);
        doc.save(`raport_wypozyczenia_${rental.rentalNumber}.pdf`);
    };

    return (
        <div>
            <h1>Raporty wypożyczeń</h1>
            <button onClick={() => setShowModal(true)}>Dodaj nowy raport</button>
            <ul>
                {rentals.map(rental => (
                    <li key={rental.id}>
                        {rental.rentalNumber} - {rental.renterName}
                        <button onClick={() => generatePDF(rental)}>Pobierz PDF</button>
                    </li>
                ))}
            </ul>
            {showModal && (
                <div className="modal">
                    <form onSubmit={handleSubmit}>
                        <label>Właściciel (imię i nazwisko):</label>
                        <input type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} required />

                        <label>Wypożyczający (imię i nazwisko):</label>
                        <input type="text" value={form.renterName} onChange={(e) => setForm({ ...form, renterName: e.target.value })} required />

                        <label>Dane wypożyczającego:</label>
                        <textarea value={form.renterDetails} onChange={(e) => setForm({ ...form, renterDetails: e.target.value })} required />

                        <label>Data wydania:</label>
                        <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required />

                        <label>Przewidywana data zwrotu:</label>
                        <input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} required />

                        <h3>Przedmioty:</h3>
                        {form.items.map((item, index) => (
                            <div key={index}>
                                <input type="text" placeholder="Nazwa" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} required />
                                <input type="number" placeholder="Ilość" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} min="1" required />
                                <input type="text" placeholder="Kategoria" value={item.category} onChange={(e) => updateItem(index, 'category', e.target.value)} required />
                                <input type="number" placeholder="Cena" value={item.price} onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))} step="0.01" required />
                                <button type="button" onClick={() => removeItem(index)}>Usuń</button>
                            </div>
                        ))}
                        <button type="button" onClick={addItem}>Dodaj przedmiot</button>

                        <label>Notatki (opcjonalne):</label>
                        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

                        <button type="submit">Zapisz raport</button>
                        <button type="button" onClick={() => setShowModal(false)}>Anuluj</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RentalView;
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const RentalView = () => {
    const [rentals, setRentals] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        ownerName: '',
        renterName: '',
        renterDetails: '',
        issueDate: '',
        returnDate: '',
        items: [{ name: '', quantity: 1, category: '', price: 0 }],
        notes: ''
    });

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        const q = query(collection(db, 'rentals'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setRentals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalValue = form.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        await addDoc(collection(db, 'rentals'), {
            ...form,
            totalValue,
            createdAt: new Date()
        });
        setShowModal(false);
        setForm({
            ownerName: '',
            renterName: '',
            renterDetails: '',
            issueDate: '',
            returnDate: '',
            items: [{ name: '', quantity: 1, category: '', price: 0 }],
            notes: ''
        });
        fetchRentals();
    };

    const addItem = () => {
        setForm({ ...form, items: [...form.items, { name: '', quantity: 1, category: '', price: 0 }] });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...form.items];
        newItems[index][field] = value;
        setForm({ ...form, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: newItems });
    };

    const generatePDF = (rental) => {
        const doc = new jsPDF();
        doc.text(`Raport wypożyczenia sprzętu ${rental.rentalNumber}`, 20, 20);
        doc.text(`Właściciel: ${rental.ownerName}`, 20, 40);
        doc.text(`Wypożyczający: ${rental.renterName} - ${rental.renterDetails}`, 20, 50);
        doc.text(`Data wydania: ${rental.issueDate}`, 20, 60);
        doc.text(`Przewidywana data zwrotu: ${rental.returnDate}`, 20, 70);

        const tableData = rental.items.map((item, index) => [
            index + 1,
            item.name,
            item.quantity,
            item.category,
            item.price.toFixed(2)
        ]);
        doc.autoTable({
            head: [['Lp.', 'Nazwa', 'Ilość', 'Kategoria', 'Cena']],
            body: tableData,
            startY: 80
        });

        doc.text(`Suma wartości: ${rental.totalValue.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
        if (rental.notes) doc.text(`Notatki: ${rental.notes}`, 20, doc.lastAutoTable.finalY + 20);
        doc.save(`raport_wypozyczenia_${rental.rentalNumber}.pdf`);
    };

    return (
        <div>
            <h1>Raporty wypożyczeń</h1>
            <button onClick={() => setShowModal(true)}>Dodaj nowy raport</button>
            <ul>
                {rentals.map(rental => (
                    <li key={rental.id}>
                        {rental.rentalNumber} - {rental.renterName}
                        <button onClick={() => generatePDF(rental)}>Pobierz PDF</button>
                    </li>
                ))}
            </ul>
            {showModal && (
                <div className="modal">
                    <form onSubmit={handleSubmit}>
                        <label>Właściciel (imię i nazwisko):</label>
                        <input type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} required />

                        <label>Wypożyczający (imię i nazwisko):</label>
                        <input type="text" value={form.renterName} onChange={(e) => setForm({ ...form, renterName: e.target.value })} required />

                        <label>Dane wypożyczającego:</label>
                        <textarea value={form.renterDetails} onChange={(e) => setForm({ ...form, renterDetails: e.target.value })} required />

                        <label>Data wydania:</label>
                        <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required />

                        <label>Przewidywana data zwrotu:</label>
                        <input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} required />

                        <h3>Przedmioty:</h3>
                        {form.items.map((item, index) => (
                            <div key={index}>
                                <input type="text" placeholder="Nazwa" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} required />
                                <input type="number" placeholder="Ilość" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))} min="1" required />
                                <input type="text" placeholder="Kategoria" value={item.category} onChange={(e) => updateItem(index, 'category', e.target.value)} required />
                                <input type="number" placeholder="Cena" value={item.price} onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))} step="0.01" required />
                                <button type="button" onClick={() => removeItem(index)}>Usuń</button>
                            </div>
                        ))}
                        <button type="button" onClick={addItem}>Dodaj przedmiot</button>

                        <label>Notatki (opcjonalne):</label>
                        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

                        <button type="submit">Zapisz raport</button>
                        <button type="button" onClick={() => setShowModal(false)}>Anuluj</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RentalView;
