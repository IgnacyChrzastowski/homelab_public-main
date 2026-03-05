#!/bin/bash

set -e

echo "=================================="
echo "   DEVOPS INSTALLER START"
echo "=================================="

# ---- KOLORY ----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR=$(pwd)
CURRENT_USER=$(whoami)

echo "Projekt w: $PROJECT_DIR"
echo "Użytkownik: $CURRENT_USER"

# ---- NAPRAWA UPRAWNIEŃ ----
echo "Naprawianie uprawnień projektu..."

sudo chown -R $CURRENT_USER:$CURRENT_USER $PROJECT_DIR || true
chmod -R u+rwX $PROJECT_DIR

# Jeśli istnieje node_modules z rootem → usuń
if [ -d "node_modules" ]; then
  echo "Czyszczenie starego node_modules..."
  rm -rf node_modules
fi

if [ -d "backend/node_modules" ]; then
  rm -rf backend/node_modules
fi

# ---- NVM ----
if [ ! -d "$HOME/.nvm" ]; then
  echo -e "${YELLOW}Instalowanie NVM...${NC}"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# ---- NODE ----
echo -e "${YELLOW}Instalowanie Node 20 LTS...${NC}"
nvm install 20
nvm use 20
nvm alias default 20

echo -e "${GREEN}Node version: $(node -v)${NC}"
echo -e "${GREEN}NPM version: $(npm -v)${NC}"

# ---- STRUKTURA ----
echo -e "${YELLOW}Tworzenie struktury katalogów...${NC}"
mkdir -p backend/uploaded_documents

# ---- .env ----
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Tworzenie .env...${NC}"
  cat <<EOL > .env
HOST=0.0.0.0
PORT=3000
REACT_APP_API_URL=http://localhost:3001
EOL
else
  echo -e "${GREEN}.env już istnieje${NC}"
fi

# ---- package.json FRONT ----
if [ ! -f "package.json" ]; then
  echo -e "${YELLOW}Tworzenie package.json (frontend)...${NC}"
  npm init -y
fi

# ---- FRONTEND INSTALL ----
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

# Nadaj prawa do node_modules (ważne dla ESLint cache)
chmod -R u+rwX node_modules

# ---- BACKEND ----
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

cd ..

# ---- START SCRIPT ----
echo -e "${YELLOW}Generowanie start.sh...${NC}"

cat <<'EOL' > start.sh
#!/bin/bash

echo "Uruchamianie frontendu..."
npm start &
FRONT_PID=$!

echo "Uruchamianie backendu..."
cd backend
node server.js &
BACK_PID=$!

cleanup() {
  echo ""
  echo "Zamykanie aplikacji..."
  kill $FRONT_PID 2>/dev/null
  kill $BACK_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT

echo "Aplikacje działają. Ctrl+C aby zatrzymać."
wait
EOL

chmod +x start.sh

# ---- SYSTEMD SERVICE ----
echo -e "${YELLOW}Konfigurowanie usługi systemd...${NC}"

# Pobranie pełnej ścieżki do Node.js
NODE_PATH=$(which node)
NPM_PATH=$(which npm)

# Tworzenie pliku usługi systemd dla backendu
echo -e "${YELLOW}Tworzenie usługi homelab-backend...${NC}"

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
Environment="PATH=$HOME/.nvm/versions/node/v20.*/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="NODE_ENV=production"
Environment="PORT=3001"

[Install]
WantedBy=multi-user.target
EOL

# Tworzenie skryptu do uruchamiania frontendu
echo -e "${YELLOW}Tworzenie usługi homelab-frontend...${NC}"

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
Environment="PATH=$HOME/.nvm/versions/node/v20.*/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="NODE_ENV=production"
Environment="PORT=3000"
Environment="REACT_APP_API_URL=http://localhost:3001"

[Install]
WantedBy=multi-user.target
EOL

# Tworzenie pliku celu do jednoczesnego uruchamiania obu usług
echo -e "${YELLOW}Tworzenie celu homelab.target...${NC}"

sudo tee /etc/systemd/system/homelab.target > /dev/null <<EOL
[Unit]
Description=Homelab Application Target
After=network.target

[Install]
WantedBy=multi-user.target
EOL

# Przeładowanie konfiguracji systemd
echo -e "${YELLOW}Przeładowanie konfiguracji systemd...${NC}"
sudo systemctl daemon-reload

# Włączenie usług (autostart przy starcie systemu)
echo -e "${YELLOW}Włączanie usług do automatycznego uruchamiania...${NC}"
sudo systemctl enable homelab-backend.service
sudo systemctl enable homelab-frontend.service

# Informacja o gotowości
echo -e "${GREEN}"
echo "=================================="
echo " INSTALACJA ZAKOŃCZONA"
echo "=================================="
echo ""
echo "Usługi systemd skonfigurowane:"
echo "=================================="
echo ""
echo "URUCHAMIANIE APLIKACJI:"
echo "  sudo systemctl start homelab-backend"
echo "  sudo systemctl start homelab-frontend"
echo ""
echo "ZATRZYMYWANIE APLIKACJI:"
echo "  sudo systemctl stop homelab-backend"
echo "  sudo systemctl stop homelab-frontend"
echo ""
echo "STATUS USŁUG:"
echo "  sudo systemctl status homelab-backend"
echo "  sudo systemctl status homelab-frontend"
echo ""
echo "WYŚWIETLANIE LOGÓW:"
echo "  sudo journalctl -u homelab-backend -f"
echo "  sudo journalctl -u homelab-frontend -f"
echo ""
echo "RESTART USŁUG:"
echo "  sudo systemctl restart homelab-backend"
echo "  sudo systemctl restart homelab-frontend"
echo ""
echo "=================================="
echo "Usługi będą automatycznie uruchamiane przy starcie systemu."
echo "=================================="
echo -e "${NC}"