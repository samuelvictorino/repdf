# RePDF - Editor Premium de PDFs

RePDF é uma ferramenta premium para manipulação e organização de documentos PDF, construída com React 19, TypeScript e Vite.

## ✨ Características

- 🎨 **Design Premium**: Interface profissional com sistema de cores consistente
- 🌓 **Tema Claro/Escuro**: Alternância automática de tema com preferências salvas
- 📁 **Manipulação de PDF**: Carregar, reorganizar, rotacionar e exportar páginas
- 🔄 **Undo/Redo**: Sistema completo de desfazer/refazer com atalhos de teclado
- 📱 **Design Responsivo**: Interface adaptável para diferentes tamanhos de tela
- 🚀 **Performance Otimizada**: Code splitting e carregamento eficiente

## 🛠️ Tecnologias

- **React 19** - Biblioteca de interface de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool moderna e rápida  
- **Tailwind CSS 4.x** - Framework CSS utility-first
- **PDF.js** - Renderização de PDF no cliente
- **pdf-lib** - Manipulação de documentos PDF

## 🚀 Desenvolvimento

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor de desenvolvimento

# Build
npm run build        # Build para produção
npm run preview      # Visualizar build de produção

# Linting
npm run lint         # Executar ESLint
```

## 📦 Build Otimizado

O projeto utiliza code splitting automático:

- **vendor.js** - React e React DOM (11.83 kB)
- **pdf.js** - Bibliotecas PDF (784.81 kB) 
- **utils.js** - Utilitários (0.89 kB)
- **index.js** - Código da aplicação (208.20 kB)

## 🎯 Roadmap

### Fase 1 ✅ - Funcionalidade Principal
- [x] Sistema de design premium
- [x] Upload e visualização de PDFs
- [x] Drag & drop para reordenação
- [x] Sistema de undo/redo
- [x] Tratamento de erros robusto

### Fase 2 🚧 - UX Avançada
- [ ] Operações em lote
- [ ] Atalhos de teclado avançados
- [ ] Zoom e visualização aprimorada
- [ ] Anotações e marcações

### Fase 3 🔮 - Integração IA
- [ ] Análise inteligente de documentos  
- [ ] Organização automática
- [ ] Extração de texto com OCR
- [ ] Sugestões de otimização

## 🐛 Resolução de Problemas

### Erro de CDN Tailwind em Produção

Se você ver o erro "cdn.tailwindcss.com should not be used in production", isso indica que uma versão antiga está sendo servida. Para resolver:

1. **Limpe o cache do navegador**
2. **Force refresh** (Ctrl+F5)
3. **Verifique se o build correto foi deployado**
4. **Desregistre service workers antigos** via DevTools > Application > Service Workers

### Build e Deploy

Para garantir um deploy correto:

```bash
# Limpe builds anteriores
rm -rf dist

# Faça um novo build
npm run build

# Teste localmente antes do deploy
npm run preview
```

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

Desenvolvido com ❤️ pela equipe RePDF

