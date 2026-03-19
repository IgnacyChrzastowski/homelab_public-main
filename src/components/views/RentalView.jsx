import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { generateRentalReportPdf } from '../../utils/pdfGenerator';
import RentalForm from '../forms/RentalForm';

/**
 * Rental reports view for managing equipment rental tracking
 * Integrates with Firebase CRUD system and component ewidencja
 * @param {Array} components - List of components
 * @param {Array} categories - List of categories
 * @param {Array} rentalReports - List of rental reports
 * @param {Function} addRentalReport - Add rental report function
 * @param {Function} removeRentalReport - Remove rental report function
 */
const RentalView = ({
    components = [],
    categories = [],
    rentalReports = [],
    addRentalReport,
    removeRentalReport
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const filteredReports = useMemo(() => {
        return rentalReports.filter(report => {
            const searchLower = searchTerm.toLowerCase();
            return (
                report.internalId?.toLowerCase().includes(searchLower) ||
                report.ownerName?.toLowerCase().includes(searchLower) ||
                report.renterName?.toLowerCase().includes(searchLower) ||
                report.issueDate?.includes(searchLower) ||
                report.returnDate?.includes(searchLower)
            );
        });
    }, [rentalReports, searchTerm]);

    const handleSaveRental = async (rentalData) => {
        try {
            await addRentalReport(rentalData, 'RW');
            toast.success('✅ Raport wypożyczenia zapisany i wygenerowany!');
        } catch (error) {
            console.error('Błąd zapisu raportu:', error);
            toast.error('Nie udało się zapisać raportu.');
        }
    };

    const handleGeneratePdf = (report) => {
        try {
            generateRentalReportPdf(report, report.internalId);
            toast.success('✅ PDF został wygenerowany!');
        } catch (error) {
            console.error('Błąd generowania PDF:', error);
            toast.error('Nie udało się wygenerować PDF.');
        }
    };

    const handleDelete = async (reportId) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten raport wypożyczenia?')) {
            try {
                await removeRentalReport(reportId);
                toast.success('Raport usunięty.');
            } catch (error) {
                console.error('Błąd usuwania:', error);
                toast.error('Nie udało się usunąć raportu.');
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Raporty Wypożyczenia Sprzętu</h1>

            <RentalForm 
                components={components} 
                categories={categories}
                onSave={handleSaveRental}
            />

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    Historia Raportów (RW)
                </h2>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Szukaj po nazwie właściciela, wypożyczającego, dacie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                        Znaleziono raportów: {filteredReports.length}
                    </p>
                </div>

                {filteredReports.length > 0 ? (
                    <div className="space-y-3">
                        {filteredReports.map(report => (
                            <div
                                key={report.id}
                                className="border border-gray-300 rounded-lg overflow-hidden hover:shadow-md transition"
                            >
                                <button
                                    onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                                    className="w-full bg-gray-50 hover:bg-gray-100 p-4 flex items-center justify-between transition"
                                >
                                    <div className="text-left">
                                        <div className="font-bold text-gray-800">
                                            {report.internalId} - {report.renterName}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Od: {report.issueDate} → Do: {report.returnDate}
                                        </div>
                                        <div className="text-sm text-gray-700 font-semibold">
                                            Właściciel: {report.ownerName} | Wartość: {report.totalValue?.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                        </div>
                                    </div>
                                    <span className={`text-xl transform transition ${expandedId === report.id ? 'rotate-180' : ''}`}>
                                        ⋯
                                    </span>
                                </button>

                                {expandedId === report.id && (
                                    <div className="bg-white border-t border-gray-300 p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-3 rounded">
                                                <h4 className="font-semibold text-gray-800 mb-2">Właściciel (Pożyczkodawca)</h4>
                                                <p className="text-sm">{report.ownerName}</p>
                                                {report.ownerDetails && (
                                                    <p className="text-xs text-gray-600">{report.ownerDetails}</p>
                                                )}
                                            </div>
                                            <div className="bg-green-50 p-3 rounded">
                                                <h4 className="font-semibold text-gray-800 mb-2">Wypożyczający (Pożyczkobiorca)</h4>
                                                <p className="text-sm">{report.renterName}</p>
                                                {report.renterDetails && (
                                                    <p className="text-xs text-gray-600">{report.renterDetails}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Data wydania:</span>
                                                <p className="text-sm font-semibold">{report.issueDate}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Data zwrotu (przewidywana):</span>
                                                <p className="text-sm font-semibold">{report.returnDate}</p>
                                            </div>
                                        </div>

                                        {report.items && report.items.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">Elementy wypożyczone</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm border border-gray-300">
                                                        <thead className="bg-orange-200">
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
                                                            {report.items.map((item, idx) => (
                                                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                    <td className="px-3 py-2">{idx + 1}</td>
                                                                    <td className="px-3 py-2 font-semibold">{item.name}</td>
                                                                    <td className="px-3 py-2">{item.categoryName || '—'}</td>
                                                                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        {item.unitPrice?.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-right font-semibold">
                                                                        {item.totalValue?.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-orange-100 p-3 rounded text-right">
                                            <span className="text-lg font-bold text-gray-800">
                                                Suma wartości: {report.totalValue?.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                            </span>
                                        </div>

                                        {report.notes && (
                                            <div className="bg-yellow-50 p-3 rounded">
                                                <h4 className="font-semibold text-gray-800 mb-2">Notatki:</h4>
                                                <p className="text-sm whitespace-pre-wrap">{report.notes}</p>
                                            </div>
                                        )}

                                        <div className="flex gap-2 justify-end border-t pt-4">
                                            <button
                                                onClick={() => handleGeneratePdf(report)}
                                                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
                                            >
                                                📥 Pobierz PDF
                                            </button>
                                            <button
                                                onClick={() => handleDelete(report.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                                            >
                                                🗑️ Usuń
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Brak raportów wypożyczenia</p>
                        <p className="text-gray-500">Utwórz nowy raport, klikając przycisk powyżej</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RentalView;

