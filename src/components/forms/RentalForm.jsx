import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getNameById } from '../../utils/helpers';

/**
 * Form for creating rental reports (analogous to invoice form)
 * Allows selection from existing components or manual entry
 * @param {Array} components - List of available components
 * @param {Array} categories - List of categories
 * @param {Function} onSave - Save handler
 */
const RentalForm = ({ components = [], categories = [], onSave }) => {
    const [componentSearchTerm, setComponentSearchTerm] = useState('');
    const [selectedComponentIds, setSelectedComponentIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [rentalForm, setRentalForm] = useState({
        ownerName: '',
        ownerDetails: '',
        renterName: '',
        renterDetails: '',
        issueDate: new Date().toISOString().substring(0, 10),
        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        notes: ''
    });

    const [manualItems, setManualItems] = useState([]);

    const filteredComponents = useMemo(() => {
        const term = componentSearchTerm.toLowerCase();
        return components.filter(comp =>
            comp.name.toLowerCase().includes(term) ||
            (comp.internalId && comp.internalId.toLowerCase().includes(term)) ||
            getNameById(comp.categoryId, categories).toLowerCase().includes(term)
        );
    }, [components, componentSearchTerm, categories]);

    const toggleComponentSelection = (componentId) => {
        setSelectedComponentIds(prev =>
            prev.includes(componentId)
                ? prev.filter(id => id !== componentId)
                : [...prev, componentId]
        );
    };

    const getRentalItems = useMemo(() => {
        const selectedComps = components
            .filter(comp => selectedComponentIds.includes(comp.id))
            .map(comp => ({
                name: comp.name,
                internalId: comp.internalId,
                categoryId: comp.categoryId,
                categoryName: getNameById(comp.categoryId, categories),
                quantity: 1,
                unitPrice: comp.value || 0,
                totalValue: comp.value || 0
            }));
        
        return [...selectedComps, ...manualItems];
    }, [components, selectedComponentIds, manualItems, categories]);

    const totalValue = useMemo(() => {
        return getRentalItems.reduce((sum, item) => sum + item.totalValue, 0);
    }, [getRentalItems]);

    const handleRentalField = (field, value) => {
        setRentalForm(prev => ({ ...prev, [field]: value }));
    };

    const addManualItem = () => {
        setManualItems(prev => [...prev, {
            name: '',
            categoryName: '',
            quantity: 1,
            unitPrice: 0,
            totalValue: 0
        }]);
    };

    const updateManualItem = (index, field, value) => {
        setManualItems(prev => {
            const newItems = [...prev];
            newItems[index][field] = value;
            
            // Recalculate total value
            if (field === 'quantity' || field === 'unitPrice') {
                newItems[index].totalValue = newItems[index].quantity * newItems[index].unitPrice;
            }
            
            return newItems;
        });
    };

    const removeManualItem = (index) => {
        setManualItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rentalForm.ownerName.trim()) {
            toast.error("Wymagane imię i nazwisko właściciela.");
            return;
        }

        if (!rentalForm.renterName.trim()) {
            toast.error("Wymagane imię i nazwisko wypożyczającego.");
            return;
        }

        if (getRentalItems.length === 0) {
            toast.error("Dodaj co najmniej jeden element do raportu.");
            return;
        }

        try {
            const rentalData = {
                ...rentalForm,
                items: getRentalItems,
                totalValue
            };

            await onSave(rentalData);
            
            // Reset form
            setRentalForm({
                ownerName: '',
                ownerDetails: '',
                renterName: '',
                renterDetails: '',
                issueDate: new Date().toISOString().substring(0, 10),
                returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
                notes: ''
            });
            setSelectedComponentIds([]);
            setManualItems([]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Błąd zapisu raportu:', error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                <span className="bg-orange-600 text-white px-2 py-1 text-sm rounded mr-2">RW</span>
                Kreator Raportów Wypożyczenia Sprzętu
            </h2>

            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors mb-4"
            >
                + Nowy Raport Wypożyczenia
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Nowy Raport Wypożyczenia</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Owner and Renter Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Właściciel (imię i nazwisko)*
                                    </label>
                                    <input
                                        type="text"
                                        value={rentalForm.ownerName}
                                        onChange={(e) => handleRentalField('ownerName', e.target.value)}
                                        placeholder="Jan Kowalski"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dane właściciela
                                    </label>
                                    <input
                                        type="text"
                                        value={rentalForm.ownerDetails}
                                        onChange={(e) => handleRentalField('ownerDetails', e.target.value)}
                                        placeholder="Tel: 123-456-789, Email: jan@example.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Wypożyczający (imię i nazwisko)*
                                    </label>
                                    <input
                                        type="text"
                                        value={rentalForm.renterName}
                                        onChange={(e) => handleRentalField('renterName', e.target.value)}
                                        placeholder="Maria Nowak"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dane wypożyczającego
                                    </label>
                                    <input
                                        type="text"
                                        value={rentalForm.renterDetails}
                                        onChange={(e) => handleRentalField('renterDetails', e.target.value)}
                                        placeholder="Tel: 987-654-321, Email: maria@example.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data wydania*
                                    </label>
                                    <input
                                        type="date"
                                        value={rentalForm.issueDate}
                                        onChange={(e) => handleRentalField('issueDate', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Przewidywana data zwrotu*
                                    </label>
                                    <input
                                        type="date"
                                        value={rentalForm.returnDate}
                                        onChange={(e) => handleRentalField('returnDate', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Components Selection */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Wybierz Komponenty z Ewidencji</h4>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder="Szukaj komponentów po nazwie lub ID..."
                                        value={componentSearchTerm}
                                        onChange={(e) => setComponentSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    <p className="text-sm text-gray-600 mt-1">Znaleziono: {filteredComponents.length}</p>
                                </div>

                                {filteredComponents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded bg-white">
                                        {filteredComponents.map(comp => (
                                            <label
                                                key={comp.id}
                                                className={`flex items-center justify-between p-3 rounded cursor-pointer transition ${
                                                    selectedComponentIds.includes(comp.id)
                                                        ? 'bg-orange-100 border-orange-300 border'
                                                        : 'bg-gray-100 border border-gray-300'
                                                }`}
                                            >
                                                <div>
                                                    <div className="font-semibold text-sm">{comp.name}</div>
                                                    <div className="text-xs text-gray-600">
                                                        {comp.internalId} • {getNameById(comp.categoryId, categories)} • {(comp.value || 0).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedComponentIds.includes(comp.id)}
                                                    onChange={() => toggleComponentSelection(comp.id)}
                                                    className="w-4 h-4"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-sm p-2">Brak komponentów do wyświetlenia</p>
                                )}
                            </div>

                            {/* Manual Items */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Lub Dodaj Elementy Ręcznie</h4>
                                
                                {manualItems.length > 0 && (
                                    <div className="space-y-3 mb-3">
                                        {manualItems.map((item, index) => (
                                            <div key={index} className="bg-white p-3 rounded border border-gray-300 space-y-2">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Nazwa*"
                                                        value={item.name}
                                                        onChange={(e) => updateManualItem(index, 'name', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Kategoria"
                                                        value={item.categoryName}
                                                        onChange={(e) => updateManualItem(index, 'categoryName', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Ilość*"
                                                        value={item.quantity}
                                                        onChange={(e) => updateManualItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        step="0.01"
                                                        className="px-3 py-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Cena jedn.*"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateManualItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        step="0.01"
                                                        className="px-3 py-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-700">
                                                        Razem: {item.totalValue.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeManualItem(index)}
                                                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                                                    >
                                                        Usuń
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={addManualItem}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
                                >
                                    + Dodaj Element
                                </button>
                            </div>

                            {/* Items Summary */}
                            {getRentalItems.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Podsumowanie Elementów</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-200">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Lp.</th>
                                                    <th className="px-3 py-2 text-left">Nazwa</th>
                                                    <th className="px-3 py-2 text-left">Kategoria</th>
                                                    <th className="px-3 py-2 text-right">Ilość</th>
                                                    <th className="px-3 py-2 text-right">Cena Jedn.</th>
                                                    <th className="px-3 py-2 text-right">Razem</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getRentalItems.map((item, idx) => (
                                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                                        <td className="px-3 py-2">{idx + 1}</td>
                                                        <td className="px-3 py-2 font-semibold">{item.name}</td>
                                                        <td className="px-3 py-2">{item.categoryName}</td>
                                                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-right">{item.unitPrice.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</td>
                                                        <td className="px-3 py-2 text-right font-semibold">{item.totalValue.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 text-right">
                                        <span className="text-lg font-bold text-gray-800">
                                            Suma wartości: {totalValue.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notatki (opcjonalne)
                                </label>
                                <textarea
                                    value={rentalForm.notes}
                                    onChange={(e) => handleRentalField('notes', e.target.value)}
                                    placeholder="Np. Warunki zwrotu, stan sprzętu..."
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                                >
                                    Zapisz i Generuj PDF
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalForm;

