# Homelab Public — dokumentacja techniczna

To repozytorium zawiera prostą aplikację React + Express (frontend + backend) używaną jako przykład i do zarządzania inwentarzem.

Spis treści
- Wstęp
- Wymagania
- Struktura projektu
- Zmienne środowiskowe
- Instalacja
  - Linux / macOS
  - Windows (PowerShell)
- Skrypty
- Uruchamianie
  - Uruchomienie lokalne (frontend + backend)
- Rozwiązywanie problemów
- Lista istotnych zależności (wersje)
- Dodatkowe uwagi i kontakty

Wstęp
------
Aplikacja składa się z:
- frontend: React (w katalogu głównym projektu)
- backend: prosty serwer Express (katalog `backend`)

Wymagania
---------
- Node.js (zalecane: 20.x LTS)
- npm (dołączone z Node)
- PowerShell 5+ na Windows (do uruchomienia skryptów .ps1)
- Uprawnienia do zapisu w katalogu projektu

Struktura projektu (istotne pliki)
---------------------------------
- `package.json` — frontend
- `backend/package.json` — backend
- `backend/server.js` — serwer Express
- `install.sh` — instalator (Linux/macOS)
- `install.ps1` — instalator (Windows, PowerShell)
- `start.sh` — skrypt uruchamiający (Linux/macOS)
- `start.ps1` — skrypt uruchamiający (Windows, PowerShell)
- `start.bat` — prosty wrapper dla Windows (uruchamia `start.ps1`)
- `.env` — zmienne środowiskowe (może być generowany przez instalator)
- `backend/uploaded_documents/` — katalog na przesłane pliki (musi istnieć)

Zmienne środowiskowe
--------------------
Plik `.env` w katalogu głównym (root) powinien zawierać co najmniej:

HOST=0.0.0.0
PORT=3000
REACT_APP_API_URL=http://localhost:3001

Instalacja
---------
Linux / macOS
1. Nadaj prawa wykonywania: `chmod +x install.sh`
2. Uruchom: `./install.sh`
   - Skrypt instaluje (lokalnie w projekcie) zależności frontend i backend
   - Tworzy `backend/uploaded_documents`
   - Generuje `start.sh` i ustawia prawa wykonania

Windows (PowerShell)
1. Otwórz PowerShell jako Administrator (zalecane).
2. Uruchom (jeśli polityka wykonywania blokuje skrypty):
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
3. Uruchom instalator: `.uild\install.ps1` (jeśli uruchamiasz z katalogu projektu użyj `.	ools\install.ps1` zależnie od lokalizacji). W tym repo skrypt znajduje się w katalogu głównym: `.	ools\install.ps1` (jeśli skrypt jest w root to `.\n4. Alternatywnie, wykonaj poniższe ręcznie:
   - Zainstaluj Node.js 20.x LTS ze strony https://nodejs.org/
   - W katalogu projektu uruchom `npm install` (frontend)
   - W katalogu `backend` uruchom `npm install`
   - Upewnij się, że istnieje katalog `backend\uploaded_documents`
   - Utwórz `.env` w katalogu root z powyższymi zmiennymi

Uwaga: skrypt PowerShell (`install.ps1`) stara się zautomatyzować powyższe kroki (próbuje wykryć Node i wykonać `npm install` z użytymi wersjami pakietów).

Skrypty
-------
- `install.sh` — instalator dla systemów Unix-like (już w repo)
- `install.ps1` — instalator dla Windows (PowerShell) — generuje także `start.ps1` i `start.bat`
- `start.sh` — uruchamia frontend i backend w jednym procesie (Unix)
- `start.ps1` — uruchamia frontend i backend w PowerShell (Windows)
- `start.bat` — prosty wrapper do uruchamiania `start.ps1` przez dwuklik

Uruchamianie
------------
Po instalacji uruchom aplikację:
Linux/macOS:
- `./start.sh`

Windows (PowerShell):
- Otwórz PowerShell i uruchom: `.\n- Lub dwukliknij `start.bat` (uruchomi `start.ps1` przez PowerShell)

Rozwiązywanie problemów
-----------------------
1. Brak Node / złe wersje:
   - Sprawdź `node -v` oraz `npm -v`. Zainstaluj Node 20.x jeśli wersja jest niższa.
2. Uprawnienia:
   - Na Linuxie użyj `chmod` i `chown` zgodnie z `install.sh`.
3. Błędy przy `npm install`:
   - Usuń `node_modules` i spróbuj ponownie `npm cache clean --force` i `npm install`.
4. Backend nie znajduje `uploaded_documents`:
   - Upewnij się, że katalog `backend/uploaded_documents` istnieje i ma prawa zapisu.

Lista istotnych zależności (wersje minimalne używane przez instalator)
------------------------------------------------------------------
Frontend:
- @tailwindcss/vite@4.1.16
- @testing-library/dom@10.4.1
- @testing-library/jest-dom@6.9.1
- @testing-library/react@16.3.0
- @testing-library/user-event@13.5.0
- autoprefixer@10.4.21
- firebase@12.4.0
- jsbarcode@3.12.1
- jspdf-autotable@5.0.2
- jspdf@3.0.3
- postcss@8.5.6
- react-dom@19.2.0
- react-hot-toast@2.6.0
- react-scripts@5.0.1
- react@19.2.0
- recharts@3.3.0
- tailwindcss@3.4.18
- web-vitals@2.1.4

Backend:
- cors@2.8.5
- express@5.1.0
- firebase-admin@13.6.0
- multer@2.0.2
- serve-index@1.9.1

Dodatkowe uwagi
---------------
- Jeśli używasz Firestore / firebase-admin, upewnij się, że pliki kluczy (`serviceAccountKey.json`) są poprawnie wstawione do katalogu `admin/` i backend ma dostęp do tych plików.
- Pliki `admin/*.json` zawierają dane wrażliwe — nie umieszczaj ich w publicznych repozytoriach.

Kontakt
-------
W razie problemów możesz otworzyć issue w repo lub skontaktować się bezpośrednio z autorem projektu.
