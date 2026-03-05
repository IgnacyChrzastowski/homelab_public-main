# Przewodnik zarządzania usługami systemd - Homelab

## Instalacja i konfiguracja

Aby zainstalować aplikację i skonfigurować usługi systemd, uruchom:

```bash
sudo bash install.sh
```

Skrypt automatycznie:
- Zainstaluje Node.js i NVM
- Zainstaluje wszystkie zależności
- Skonfiguruje dwie usługi systemd:
  - `homelab-backend.service` - serwer backendu (port 3001)
  - `homelab-frontend.service` - aplikacja React (port 3000)
- Włączy automatyczne uruchamianie usług przy starcie systemu

## Zarządzanie usługami

### Uruchamianie

```bash
# Uruchomienie backendu
sudo systemctl start homelab-backend

# Uruchomienie frontendu
sudo systemctl start homelab-frontend

# Uruchomienie obu jednocześnie
sudo systemctl start homelab-backend homelab-frontend
```

### Zatrzymywanie

```bash
# Zatrzymanie backendu
sudo systemctl stop homelab-backend

# Zatrzymanie frontendu
sudo systemctl stop homelab-frontend

# Zatrzymanie obu jednocześnie
sudo systemctl stop homelab-backend homelab-frontend
```

### Restart

```bash
# Restart backendu
sudo systemctl restart homelab-backend

# Restart frontendu
sudo systemctl restart homelab-frontend

# Restart obu usług
sudo systemctl restart homelab-backend homelab-frontend
```

### Status i diagnostyka

```bash
# Sprawdzenie statusu backendu
sudo systemctl status homelab-backend

# Sprawdzenie statusu frontendu
sudo systemctl status homelab-frontend

# Sprawdzenie statusu obu
sudo systemctl status homelab-backend homelab-frontend
```

### Wyświetlanie logów

```bash
# Logi backendu (ciągłe, ostatnie 100 linii)
sudo journalctl -u homelab-backend -f

# Logi frontendu (ciągłe, ostatnie 100 linii)
sudo journalctl -u homelab-frontend -f

# Logi backendu (ostatnie 50 linii)
sudo journalctl -u homelab-backend -n 50

# Logi frontendu (ostatnie 50 linii)
sudo journalctl -u homelab-frontend -n 50

# Logi z ostatniej godziny
sudo journalctl -u homelab-backend --since "1 hour ago"
sudo journalctl -u homelab-frontend --since "1 hour ago"
```

## Autostart - włączanie i wyłączanie

### Włączenie automatycznego uruchamiania

```bash
# Backend uruchamia się przy starcie systemu
sudo systemctl enable homelab-backend

# Frontend uruchamia się przy starcie systemu
sudo systemctl enable homelab-frontend
```

### Wyłączenie automatycznego uruchamiania

```bash
# Backend nie będzie się uruchamiać automatycznie
sudo systemctl disable homelab-backend

# Frontend nie będzie się uruchamiać automatycznie
sudo systemctl disable homelab-frontend
```

### Sprawdzenie czy usługa jest włączona do autostartu

```bash
# Backend
sudo systemctl is-enabled homelab-backend

# Frontend
sudo systemctl is-enabled homelab-frontend
```

## Ścieżki ważnych plików

- **Usługa backendu**: `/etc/systemd/system/homelab-backend.service`
- **Usługa frontendu**: `/etc/systemd/system/homelab-frontend.service`
- **Cel aplikacji**: `/etc/systemd/system/homelab.target`
- **Katalog projektu**: Zostanie ustawiony podczas instalacji
- **Logi systemowe**: `/var/log/syslog` lub `/var/log/messages`

## Edycja plików usług

Jeśli chcesz zmienić konfigurację usługi, edytuj plik usługi:

```bash
# Edytuj usługę backendu
sudo nano /etc/systemd/system/homelab-backend.service

# Edytuj usługę frontendu
sudo nano /etc/systemd/system/homelab-frontend.service
```

Po edycji przeładuj konfigurację:

```bash
sudo systemctl daemon-reload
```

## Rozwiązywanie problemów

### Usługa się nie uruchamia

1. Sprawdź status:
```bash
sudo systemctl status homelab-backend
```

2. Sprawdź logi:
```bash
sudo journalctl -u homelab-backend -n 50
```

3. Sprawdź uprawnienia do plików w katalogu projektu:
```bash
ls -la /ścieżka/do/projektu/
```

4. Upewnij się, że port 3000 i 3001 nie są zajęte:
```bash
sudo netstat -tuln | grep -E ':(3000|3001)'
```

### Problemy z Node.js

Jeśli usługa nie może znaleźć Node.js:

```bash
# Sprawdź gdzie jest zainstalowany Node
which node
which npm

# Sprawdź wersję
node -v
npm -v

# Jeśli to problem z NVM, dodaj do zmiennej PATH w pliku usługi
sudo nano /etc/systemd/system/homelab-backend.service
```

Upewnij się, że linia `Environment="PATH=..."` zawiera ścieżkę do NVM.

### Czyszczenie logów

```bash
# Wymaż logi starsze niż 7 dni
sudo journalctl --vacuum-time=7d

# Wymaż logi aby zajmowały maksymalnie 100MB
sudo journalctl --vacuum-size=100M
```

## Informacje dodatkowe

- Backend uruchamia się na porcie **3001**
- Frontend uruchamia się na porcie **3000**
- Frontend automatycznie łączy się z backendem na `http://localhost:3001`
- Usługi mają ustawiony `Restart=always`, co oznacza że będą restartować się automatycznie w przypadku awarii
- Opóźnienie między restartami wynosi 10 sekund

