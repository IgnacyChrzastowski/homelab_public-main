# Homelab Public — dokumentacja techniczna

To repozytorium zawiera prostą aplikację React + Express (frontend + backend) używaną do zarządzania inwentarzem.

## 🚀 Szybki start

### Raspberry Pi / Linux
```bash
bash install.sh
```
Skrypt automatycznie zainstaluje wszystko i skonfiguruje usługi systemd z autostartem.

### Windows
```powershell
.\install.ps1
.\start.bat
```

---

## 📋 Spis treści
- [Wstęp](#wstęp)
- [Wymagania](#wymagania)
- [Instalacja](#instalacja)
- [Uruchamianie](#uruchamianie)
- [Zarządzanie usługami systemd](#zarządzanie-usługami-systemd)
- [Rozwiązywanie problemów](#rozwiązywanie-problemów)
- [Zależności](#zależności)

---

## Wstęp

Aplikacja składa się z:
- **Frontend**: React aplikacja (katalog główny)
- **Backend**: Prosty serwer Express (katalog `backend`)

**Wersja 2.0+:** Skrypt `install.sh` automatycznie konfiguruje usługi systemd na Linux/Raspberry Pi:
- `homelab-backend.service` — serwer Node.js (port 3001)
- `homelab-frontend.service` — aplikacja React (port 3000)

Po instalacji aplikacja będzie:
- ✅ Uruchamiana automatycznie przy starcie systemu
- ✅ Restartowana w przypadku awarii
- ✅ Zarządzana poleceniami `systemctl`

---

## Wymagania

- **Node.js** 20.x LTS
- **npm** (dołączone z Node.js)
- **PowerShell 5+** (tylko Windows)
- **Uprawnienia do zapisu** w katalogu projektu
- **Dla Raspberry Pi**: minimum 1GB RAM, 2GB wolnej przestrzeni

---

## Instalacja

### Raspberry Pi / Linux (z systemd - rekomendowany) ⭐

**WAŻNE: Nie uruchamiaj z sudo!**

```bash
# 1. Sklonuj projekt
git clone <URL> homelab && cd homelab

# 2. Uruchom instalator (BEZ sudo!)
bash install.sh

# 3. Gotowe! Aplikacja uruchamia się przy starcie systemu
```

Skrypt automatycznie:
- ✅ Zainstaluje NVM i Node.js 20 LTS
- ✅ Zainstaluje wszystkie zależności
- ✅ Skonfiguruje usługi systemd
- ✅ Włączy autostart

### Linux / macOS (interaktywnie, bez systemd)

```bash
chmod +x install.sh
./install.sh
./start.sh
```

### Windows (PowerShell)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install.ps1
.\start.bat
```

---

## Uruchamianie

### Raspberry Pi / Linux (systemd)

```bash
# Uruchomienie
sudo systemctl start homelab-backend homelab-frontend

# Zatrzymanie
sudo systemctl stop homelab-backend homelab-frontend

# Restart
sudo systemctl restart homelab-backend homelab-frontend

# Status
sudo systemctl status homelab-backend homelab-frontend
```

**Dostęp do aplikacji:**
- Frontend: `http://localhost:3000` (lub `http://<IP_RASPBERRY>:3000`)
- Backend: `http://localhost:3001` (lub `http://<IP_RASPBERRY>:3001`)

### Linux/macOS (interaktywnie)

```bash
./start.sh
```

---

## Zarządzanie usługami systemd

### Wyświetlanie logów

```bash
# Backend - ostatnie 50 linii
sudo journalctl -u homelab-backend -n 50

# Backend - ciągłe (Ctrl+C aby wyjść)
sudo journalctl -u homelab-backend -f

# Frontend - ciągłe (Ctrl+C aby wyjść)
sudo journalctl -u homelab-frontend -f
```

### Autostart

```bash
# Włącz autostart (uruchamiaj się przy starcie)
sudo systemctl enable homelab-backend homelab-frontend

# Wyłącz autostart
sudo systemctl disable homelab-backend homelab-frontend

# Sprawdzenie
sudo systemctl is-enabled homelab-backend
```

### Resetowanie usług

```bash
# Resetuj licznik restartów
sudo systemctl reset-failed homelab-backend homelab-frontend

# Przeładuj konfigurację (po edycji)
sudo systemctl daemon-reload
```

---

## Rozwiązywanie problemów

### ❌ Błąd: "env: 'node': No such file or directory"

**Przyczyna:** Systemd nie może znaleźć Node.js

**Rozwiązanie:**
```bash
# 1. Wyloguj się z sudo (jeśli w sudo su)
exit

# 2. Sprawdź czy jesteś użytkownikiem pi
whoami

# 3. Załaduj NVM
source ~/.nvm/nvm.sh

# 4. Sprawdź Node.js
node -v

# 5. Zrestartuj usługi
sudo systemctl restart homelab-backend homelab-frontend

# 6. Sprawdź logi
sudo journalctl -u homelab-frontend -n 50
```

### ❌ Skrypt uruchomiony z sudo

Jeśli widzisz: "BŁĄD: Nie uruchamiaj tego skryptu z sudo!"

```bash
exit                    # Wyloguj się
bash install.sh         # Uruchom poprawnie (BEZ sudo)
```

### ❌ Aplikacja restartuje się w pętli

```bash
# Sprawdź przyczynę
sudo journalctl -u homelab-backend -n 100

# Resetuj i zrestartuj
sudo systemctl reset-failed homelab-backend
sudo systemctl restart homelab-backend
```

### ❌ Port już w użytku

```bash
# Sprawdź proces
sudo lsof -i :3000
sudo lsof -i :3001

# Zabij proces
sudo kill -9 <PID>

# Zrestartuj
sudo systemctl restart homelab-backend homelab-frontend
```

### ❌ Zbyt dużo pamięci RAM

Jeśli Raspberry Pi się zawiesza:

```bash
# Sprawdź użycie RAM
free -h

# Sprawdź procesy
top -b -n 1
```

---

## Zmienne środowiskowe

Plik `.env` w katalogu głównym (generowany przez instalator):

```
HOST=0.0.0.0
PORT=3000
REACT_APP_API_URL=http://localhost:3001
```

---

## Struktura katalogów

```
homelab_public-main/
├── install.sh                    ← Instalator (Linux/Raspberry Pi)
├── install.ps1                   ← Instalator (Windows)
├── start.sh                       ← Uruchamianie (Linux/macOS)
├── start.ps1                      ← Uruchamianie (Windows)
├── start.bat                      ← Wrapper dla Windows
├── package.json                   ← Frontend
├── backend/
│   ├── package.json              ← Backend
│   ├── server.js                 ← Serwer Express
│   └── uploaded_documents/        ← Przesłane pliki
├── src/                          ← Kod React
├── public/                       ← Pliki statyczne
└── admin/                        ← Klucze Firebase (nie commit!)
```

---

## Zależności

### Frontend
- react@19.2.0
- firebase@12.4.0
- jspdf@3.0.3
- recharts@3.3.0
- tailwindcss@3.4.18
- jsbarcode@3.12.1

### Backend
- express@5.1.0
- firebase-admin@13.6.0
- cors@2.8.5
- multer@2.0.2

---

## Uwagi bezpieczeństwa

⚠️ **Ważne:**
- Nigdy nie umieszczaj `serviceAccountKey.json` w publicznym repo
- Plik `admin/` zawiera wrażliwe dane - dodaj do `.gitignore`
- Używaj zmiennych `.env` do przechowywania sekretów

### Podatności npm (CVEs)

Instalator automatycznie naprawia podatności przy pomocy `npm audit fix --force`.

- **Frontend (React)**: Warningi o deprecated pakietach to normalne - nie wpływają na bezpieczeństwo aplikacji
- **Backend (Express)**: Podatności są naprawianie automatycznie

Więcej informacji: patrz [SECURITY.md](SECURITY.md)

---

## Dodatkowe informacje

- **Logs**: `/var/log/syslog` lub `journalctl`
- **Konfiguracja systemd**: `/etc/systemd/system/homelab-*.service`
- **Projekt**: Linux/Raspberry Pi OS, Node.js 20 LTS

Powodzenia! 🚀

