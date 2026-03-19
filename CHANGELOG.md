# Changelog

## [1.1.0] - 2026-03-19

### Dodano
- **System Raportów Wypożyczenia Sprzętu** - kompletna funkcjonalność do tworzenia, zarządzania i generowania raportów PDF dla wypożyczania sprzętu
  - Kreator raportów z wyborem komponentów z ewidencji
  - Automatyczna numeracja raportów (RW1/03/26, RW2/03/26, itp.)
  - Generowanie profesjonalnych raportów PDF z tabelami
  - Przechowywanie w Firebase z wyszukiwaniem
  - Menu: "Raporty Wypożyczenia" w interfejsie głównym

### Naprawiono
- **install.ps1** - naprawiono błędy parsowania PowerShell związane z kodowaniem polskich znaków
- **start.ps1** i **start.bat** - poprawiono generowanie skryptów uruchamiających

### Zmiany techniczne
- Dodano komponenty: `RentalForm.jsx`, `RentalView.jsx`
- Dodano funkcję: `generateRentalReportPdf()` w `pdfGenerator.js`
- Zaktualizowano: `App.jsx`, `Sidebar.jsx`
- Rozszerzono Firebase o kolekcję `rentalReports`

## [1.0.0] - 2026-01-01
- Wersja początkowa aplikacji Homelab Ewidencja
