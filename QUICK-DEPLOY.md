# ⚡ Quick Deploy Guide - RePDF

## 🚀 Deploy em 5 Minutos

### **Opção 1: Vercel (Recomendado)**

1. **Preparar**:
   ```bash
   ./deploy.sh
   ```

2. **GitHub + Vercel**:
   - Faça push para GitHub
   - Acesse [vercel.com](https://vercel.com)
   - Import Project → seu repo
   - Adicione `GEMINI_API_KEY` nas Environment Variables
   - Deploy! 🎉

### **Opção 2: Netlify**

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - Arraste pasta `dist` para [netlify.com](https://netlify.com)
   - Ou use: `netlify deploy --prod --dir=dist`
   - Adicione `GEMINI_API_KEY` no dashboard

### **Opção 3: GitHub Pages**

```bash
npm install gh-pages --save-dev
npm run deploy:gh-pages
```

---

## 🔑 API Key Necessária

**Google Gemini API Key** para funcionalidade OCR:
- Acesse: https://makersuite.google.com/app/apikey
- Crie uma nova API key
- Configure na plataforma de deploy

---

## ✅ Checklist de Deploy

- [ ] Build funciona localmente (`npm run build`)
- [ ] API Key configurada na plataforma
- [ ] Domínio configurado (opcional)
- [ ] HTTPS habilitado
- [ ] Cache configurado

---

## 🎯 URLs de Exemplo

Após deploy, sua aplicação estará disponível em:

- **Vercel**: `https://seu-projeto.vercel.app`
- **Netlify**: `https://seu-projeto.netlify.app`
- **GitHub Pages**: `https://username.github.io/repdf`

---

## 🚨 Solução de Problemas

**Build falha?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**API não funciona?**
- Verifique se `GEMINI_API_KEY` está configurada
- Confirme se a key tem permissões corretas
- Teste localmente primeiro

**CORS issues?**
- Configurações já incluídas nos arquivos de config
- Verifique console do browser para erros

---

## 📱 Recursos Funcionais no Deploy

✅ **Processamento PDF** - Cliente-side  
✅ **OCR com Gemini** - Via API  
✅ **Multi-idioma** - PT/EN/ES  
✅ **Temas** - Claro/Escuro  
✅ **Responsivo** - Mobile/Desktop  
✅ **PWA Ready** - Pode ser instalado  

---

**Deploy Time: ~5 minutos** ⏱️  
**Zero servidor necessário** 🌟  
**Funciona offline** (exceto OCR) 📱