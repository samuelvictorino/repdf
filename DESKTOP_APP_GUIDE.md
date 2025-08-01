# 💻 RePDF Desktop App Guide

## 🎯 Como Tornar o RePDF Instalável (Windows, Mac, Linux)

### **Método 1: PWA (Progressive Web App) - Recomendado**

#### ✅ **Vantagens**:
- Instalação direta pelo navegador
- Updates automáticos 
- Funciona offline
- IA offline (Ollama) funcional
- Tamanho reduzido (~10MB)
- Cross-platform nativo

#### **Configuração PWA:**

**1. Criar manifest.json:**
```json
{
  "name": "RePDF - Suite Executivo PDF",
  "short_name": "RePDF",
  "description": "Organização e automação inteligente de documentos PDF",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1f2937",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "categories": ["productivity", "utilities"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png", 
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128", 
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Novo Documento",
      "short_name": "Novo",
      "description": "Criar novo documento PDF",
      "url": "/new",
      "icons": [{ "src": "/icons/new-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Abrir Arquivo",
      "short_name": "Abrir", 
      "description": "Abrir arquivo PDF existente",
      "url": "/open",
      "icons": [{ "src": "/icons/open-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

**2. Service Worker (sw.js):**
```javascript
const CACHE_NAME = 'repdf-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch  
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

**3. Registrar no index.html:**
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3b82f6">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="RePDF">

<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed'));
  });
}
</script>
```

### **Como Instalar para Usuários:**

#### **Windows 10/11:**
1. Abrir **repdf.vercel.app** no Edge/Chrome
2. Clicar no ícone "Instalar app" na barra de endereços
3. Confirmar instalação
4. App aparece no Menu Iniciar

#### **macOS:**
1. Abrir **repdf.vercel.app** no Safari/Chrome
2. Chrome: Menu > "Instalar RePDF..."
3. Safari: Compartilhar > "Adicionar ao Dock"
4. App aparece no Launchpad

#### **Linux (Ubuntu/Fedora):**
1. Abrir **repdf.vercel.app** no Firefox/Chrome
2. Menu do navegador > "Instalar RePDF"
3. App aparece no menu de aplicações

---

### **Método 2: Electron App (Avançado)**

#### ✅ **Vantagens**:
- Controle total do ambiente
- Integração profunda com OS
- Distribuição via executáveis
- File system access completo

#### **Setup Electron:**

**1. Instalar dependências:**
```bash
npm install --save-dev electron electron-builder
```

**2. Criar main.js:**
```javascript
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false // Para PDFs locais
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Menu
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        { label: 'Novo', accelerator: 'CmdOrCtrl+N' },
        { label: 'Abrir', accelerator: 'CmdOrCtrl+O' },
        { type: 'separator' },
        { label: 'Sair', role: 'quit' }
      ]
    },
    {
      label: 'Editar', 
      submenu: [
        { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z' },
        { label: 'Refazer', accelerator: 'CmdOrCtrl+Y' },
        { type: 'separator' },
        { label: 'Selecionar Tudo', accelerator: 'CmdOrCtrl+A' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

**3. Package.json scripts:**
```json
{
  "main": "main.js",
  "scripts": {
    "electron": "electron .",
    "electron:dev": "NODE_ENV=development electron .",
    "build:electron": "npm run build && electron-builder",
    "dist": "electron-builder --publish=never"
  },
  "build": {
    "appId": "com.repdf.app",
    "productName": "RePDF",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "main.js",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": "dmg"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

---

### **🤖 Integração IA Offline (Ollama)**

#### **Configuração para Desktop:**

**1. Auto-detecção de ambiente:**
```typescript
// src/services/ollamaService.ts
const isDesktop = () => {
  return window.location.protocol === 'file:' || 
         window.location.hostname === 'localhost' ||
         (window as any).electronAPI;
};

const getOllamaUrls = () => {
  if (isDesktop()) {
    return [
      'http://localhost:11434',    // Padrão Ollama
      'http://127.0.0.1:11434',    // Alternativo
      'http://0.0.0.0:11434'       // Docker
    ];
  }
  return ['http://ollama:11434']; // Container web
};
```

**2. Instruções de instalação Ollama:**

**Windows:**
```powershell
# Download do site oficial
# https://ollama.ai/download/windows
# Executar installer
# Instalar modelos:
ollama pull gemma2:2b    # Modelo leve (1.6GB)
ollama pull phi3:mini    # Alternativo (2.3GB)
```

**macOS:**
```bash
# Via Homebrew
brew install ollama
# Ou download do site oficial
# Instalar modelos:
ollama pull gemma2:2b
ollama pull phi3:mini
```

**Linux:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
# Start service
systemctl start ollama
# Install models
ollama pull gemma2:2b
ollama pull phi3:mini
```

---

### **📦 Distribuição**

#### **PWA Deployment:**
```bash
# Build para produção
npm run build

# Deploy no Vercel (já configurado)
git push origin main

# URLs de instalação:
# https://repdf.vercel.app (automático)
```

#### **Electron Distribution:**
```bash
# Build para todas plataformas
npm run build:electron

# Outputs em dist-electron/:
# - RePDF-1.0.0.dmg (macOS)
# - RePDF Setup 1.0.0.exe (Windows) 
# - RePDF-1.0.0.AppImage (Linux)
```

---

### **🚀 Implementação Imediata - PWA**

**Arquivos necessários:**

1. **public/manifest.json** ✅
2. **public/sw.js** ✅  
3. **Ícones PWA** (gerar com https://realfavicongenerator.net/)
4. **Update index.html** com meta tags PWA ✅

**Resultado:**
- ✅ App instalável via navegador
- ✅ Funciona offline  
- ✅ IA Ollama funcional
- ✅ Updates automáticos
- ✅ Cross-platform (Win/Mac/Linux)
- ✅ ~10MB instalado vs ~200MB Electron

---

### **💡 Próximos Passos**

1. **Implementar PWA** (2-3 horas)
2. **Gerar ícones PWA** (30 min)
3. **Testar instalação** em Win/Mac/Linux (1 hora)
4. **Documentar processo** para usuários (30 min)

**Total: ~4 horas para app desktop funcional**

---

**🌟 RePDF Desktop será uma ferramenta premium instalável mantendo toda funcionalidade IA offline!**