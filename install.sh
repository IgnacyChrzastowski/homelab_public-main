#!/bin/bash

set -e

echo "=================================="
echo "   HOMELAB - UNIVERSAL INSTALLER"
echo "=================================="
echo ""

# ---- KOLORY ----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR=$(pwd)
CURRENT_USER=$(whoami)

echo "📁 Katalog projektu: $PROJECT_DIR"
echo "👤 Użytkownik: $CURRENT_USER"
echo ""

# ---- SPRAWDZENIE CZY NIE SUDO ----
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}❌ BŁĄD: Nie uruchamiaj tego skryptu z sudo!${NC}"
  echo ""
  echo "Uruchom poprawnie:"
  echo "  bash install.sh"
  echo ""
  exit 1
fi

# ---- NAPRAWA UPRAWNIEŃ ----
echo -e "${YELLOW}🔧 Naprawianie uprawnień projektu...${NC}"
sudo chown -R $CURRENT_USER:$CURRENT_USER $PROJECT_DIR || true
chmod -R u+rwX $PROJECT_DIR

# Czyszczenie starych node_modules
if [ -d "node_modules" ]; then
  echo "  Czyszczenie starego node_modules..."
  rm -rf node_modules
fi
if [ -d "backend/node_modules" ]; then
  rm -rf backend/node_modules
fi

# ---- NVM ----
echo ""
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}   NVM i NODE.JS${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

if [ ! -d "$HOME/.nvm" ]; then
  echo -e "${YELLOW}Instalowanie NVM...${NC}"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
  echo -e "${GREEN}✓ NVM już zainstalowany${NC}"
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# ---- NODE ----
echo -e "${YELLOW}Instalowanie Node 20 LTS...${NC}"
nvm install 20
nvm use 20
nvm alias default 20

echo -e "${GREEN}✓ Node version: $(node -v)${NC}"
echo -e "${GREEN}✓ NPM version: $(npm -v)${NC}"

# ---- STRUKTURA ----
echo ""
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}   STRUKTURA KATALOGÓW${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

mkdir -p backend/uploaded_documents
echo -e "${GREEN}✓ Katalogi gotowe${NC}"

# ---- .env ----
echo ""
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}   ZMIENNE ŚRODOWISKOWE${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Tworzenie .env...${NC}"
  cat <<EOL > .env
HOST=0.0.0.0
PORT=3000
REACT_APP_API_URL=http://localhost:3001
EOL
  echo -e "${GREEN}✓ Plik .env utworzony${NC}"
else
  echo -e "${GREEN}✓ .env już istnieje${NC}"
fi

# ---- FRONTEND ----
echo ""
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}   FRONTEND - INSTALACJA${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

if [ ! -f "package.json" ]; then
  echo -e "${YELLOW}Tworzenie package.json (frontend)...${NC}"
  npm init -y
fi

echo -e "${YELLOW}Instalowanie zależności frontend...${NC}"
npm install \
  @tailwindcss/vite@4.1.16 \
  @testing-library/dom@10.4.1 \
  @testing-library/jest-dom@6.9.1 \
  @testing-library/react@16.3.0 \
  @testing-library/user-event@13.5.0 \
  autoprefixer@10.4.21 \
  firebase@12.4.0 \
  jsbarcode@3.12.1 \
  jspdf-autotable@5.0.2 \
  jspdf@3.0.3 \
  postcss@8.5.6 \
  react-dom@19.2.0 \
  react-hot-toast@2.6.0 \
  react-scripts@5.0.1 \
  react@19.2.0 \
  recharts@3.3.0 \
  tailwindcss@3.4.18 \
  web-vitals@2.1.4

chmod -R u+rwX node_modules

# Naprawianie podatności (musi być w katalogu projektu)
echo -e "${YELLOW}Naprawianie podatności frontend...${NC}"
npm audit fix --force 2>/dev/null || true

echo -e "${GREEN}✓ Frontend zainstalowany${NC}"

# ---- BACKEND ----
echo ""
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}   BACKEND - INSTALACJA${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

cd backend

if [ ! -f "package.json" ]; then
  echo -e "${YELLOW}Tworzenie package.json (backend)...${NC}"
  npm init -y
fi

echo -e "${YELLOW}Instalowanie zależności backend...${NC}"
npm install \
  cors@2.8.5 \
  express@5.1.0 \
  firebase-admin@13.6.0 \
  multer@2.0.2 \
  serve-index@1.9.1

chmod -R u+rwX node_modules

echo -e "${GREEN}✓ Backend zainstalowany${NC}"

cd ..

# ---- NAPRAWIANIE PODATNOŚCI ----
echo ""
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}   NAPRAWIANIE PODATNOŚCI${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

echo -e "${YELLOW}Naprawianie podatności backend...${NC}"
cd backend
npm audit fix --force 2>/dev/null || true
cd ..
echo -e "${GREEN}✓ Backend naprawiony${NC}"

# ---- SYSTEMD CONFIGURATION ----
echo ""
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}   KONFIGURACJA SYSTEMD${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

# Pobranie ścieżek Node.js
NODE_PATH=$(which node)
NPM_PATH=$(which npm)
NVM_BIN_DIR=$(dirname "$NODE_PATH")

echo "Znalezione:"
echo "  Node.js: $NODE_PATH"
echo "  NPM: $NPM_PATH"
echo "  NVM bin: $NVM_BIN_DIR"
echo ""

# Backend service
echo -e "${YELLOW}Tworzenie homelab-backend.service...${NC}"
sudo tee /etc/systemd/system/homelab-backend.service > /dev/null <<EOL
[Unit]
Description=Homelab Backend Service
After=network.target
Wants=homelab-frontend.service

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$PROJECT_DIR/backend
ExecStart=$NODE_PATH server.js
Restart=always
RestartSec=10
Environment="PATH=$NVM_BIN_DIR:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="NODE_ENV=production"
Environment="PORT=3001"

[Install]
WantedBy=multi-user.target
EOL
echo -e "${GREEN}✓ homelab-backend.service gotowy${NC}"

# Frontend service
echo -e "${YELLOW}Tworzenie homelab-frontend.service...${NC}"
sudo tee /etc/systemd/system/homelab-frontend.service > /dev/null <<EOL
[Unit]
Description=Homelab Frontend Service
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$PROJECT_DIR
ExecStart=$NPM_PATH start
Restart=always
RestartSec=10
Environment="PATH=$NVM_BIN_DIR:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="NODE_ENV=production"
Environment="PORT=3000"
Environment="REACT_APP_API_URL=http://localhost:3001"

[Install]
WantedBy=multi-user.target
EOL
echo -e "${GREEN}✓ homelab-frontend.service gotowy${NC}"

# Reload systemd
echo -e "${YELLOW}Przeładowanie konfiguracji systemd...${NC}"
sudo systemctl daemon-reload
echo -e "${GREEN}✓ Systemd przeładowany${NC}"

# Enable services
echo -e "${YELLOW}Włączanie autostartu...${NC}"
sudo systemctl enable homelab-backend.service
sudo systemctl enable homelab-frontend.service
echo -e "${GREEN}✓ Autostart włączony${NC}"

# ---- PODSUMOWANIE ----
echo ""
echo -e "${GREEN}=================================="
echo "   ✓ INSTALACJA ZAKOŃCZONA"
echo "==================================${NC}"
echo ""
echo -e "${BLUE}🚀 URUCHAMIANIE APLIKACJI:${NC}"
echo "  sudo systemctl start homelab-backend homelab-frontend"
echo ""
echo -e "${BLUE}📊 SPRAWDZENIE STATUSU:${NC}"
echo "  sudo systemctl status homelab-backend homelab-frontend"
echo ""
echo -e "${BLUE}📋 WYŚWIETLANIE LOGÓW:${NC}"
echo "  sudo journalctl -u homelab-backend -f      # Backend"
echo "  sudo journalctl -u homelab-frontend -f     # Frontend"
echo ""
echo -e "${BLUE}⏸️  ZATRZYMYWANIE:${NC}"
echo "  sudo systemctl stop homelab-backend homelab-frontend"
echo ""
echo -e "${BLUE}🔄 RESTART:${NC}"
echo "  sudo systemctl restart homelab-backend homelab-frontend"
echo ""
echo -e "${BLUE}🌐 DOSTĘP:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "IP Raspberry Pi: $(hostname -I)"
echo ""

