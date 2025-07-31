# 🚀 Guia Passo-a-Passo: Deploy RePDF

## ✅ Já Feito:
- [x] Repositório GitHub criado
- [x] Código enviado para GitHub
- [x] Commit no README.md feito

## 🔄 Próximos Passos:

### 🔸 Passo 1: Project ID do Google Cloud
1. Vá para: https://console.cloud.google.com
2. No topo da página, clique no nome do projeto (dropdown)
3. COPIE o "Project ID" (não o nome)
4. Exemplo: se mostra "my-project-123456", copie isso

**Project ID encontrado:** `_____________`

---

### 🔸 Passo 2: Service Account
1. Vá para: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Clique: "Create Service Account"
3. Preencha:
   - **Name:** `github-deploy`
   - **Description:** `Deploy via GitHub Actions`
4. Clique: "Create and Continue"

5. **Adicionar Roles** (muito importante!):
   - Clique "Add Role" e adicione UMA POR VEZ:
   - ✅ `Cloud Run Admin`
   - ✅ `Storage Admin`
   - ✅ `Container Registry Service Agent`
   - ✅ `Service Account User`

6. Clique: "Continue" → "Done"

**Service Account criado:** `[ ] Sim [ ] Não`

---

### 🔸 Passo 3: Chave JSON
1. Na lista de Service Accounts, clique em "github-deploy"
2. Vá para aba "Keys"
3. Clique: "Add Key" → "Create new key"
4. Selecione: "JSON"
5. Clique: "Create"
6. Um arquivo .json será baixado automaticamente

**Arquivo JSON baixado:** `[ ] Sim [ ] Não`

---

### 🔸 Passo 4: GitHub Secrets
1. Vá para: https://github.com/samuelvictorino/repdf
2. Clique: "Settings" (menu do repositório)
3. Menu lateral: "Secrets and variables" → "Actions"
4. Clique: "New repository secret"

**Secret 1:**
- Name: `GCP_PROJECT_ID`
- Value: `[Cole aqui o Project ID do Passo 1]`

**Secret 2:**
- Name: `GCP_SA_KEY`
- Value: `[Cole aqui TODO conteúdo do arquivo JSON]`

*Para o Secret 2: Abra o arquivo JSON em um editor de texto, selecione TUDO (Ctrl+A) e cole*

**Secrets configurados:** `[ ] Sim [ ] Não`

---

### 🔸 Passo 5: Habilitar APIs
Vá para: https://console.cloud.google.com/apis/library

**Procure e habilite uma por vez:**

1. **Cloud Build API**
   - Digite "Cloud Build API" na busca
   - Clique na API
   - Se não estiver habilitada, clique "Enable"

2. **Cloud Run Admin API**
   - Digite "Cloud Run Admin API" na busca
   - Clique na API
   - Se não estiver habilitada, clique "Enable"

3. **Container Registry API**
   - Digite "Container Registry API" na busca
   - Clique na API
   - Se não estiver habilitada, clique "Enable"

**APIs habilitadas:** `[ ] Sim [ ] Não`

---

## 🚀 Teste Final

Depois de tudo configurado:

1. Faça uma pequena alteração em qualquer arquivo
2. Execute:
   ```bash
   git add .
   git commit -m "Test automatic deploy"
   git push origin main
   ```

3. Vá para: https://github.com/samuelvictorino/repdf/actions
4. Você verá o deploy acontecendo!

**Deploy funcionou:** `[ ] Sim [ ] Não`

---

## 📞 Precisa de Ajuda?

Se tiver dificuldade em qualquer passo:
1. Me diga em qual passo parou
2. Descreva o que está vendo na tela
3. Posso te ajudar com prints ou explicações mais detalhadas

**Próximo passo que precisa de ajuda:** `_____________`