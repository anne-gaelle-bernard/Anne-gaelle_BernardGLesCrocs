# CI/CD Setup

## GitHub Actions

Le workflow CI/CD se déclenche automatiquement sur chaque push vers `main`.

### Étapes :
1. Checkout du code
2. Installation Node.js 20
3. `npm install` backend
4. `npm install` frontend
5. `npm run build` frontend
6. Notification Google Chat

## Configuration Google Chat Webhook

### 1. Créer un webhook Google Chat
1. Ouvre Google Chat
2. Va dans l'espace où tu veux recevoir les notifications
3. Clique sur le nom de l'espace en haut → Apps & intégrations
4. Webhooks → Ajouter un webhook
5. Donne un nom (ex: "CI/CD Bot")
6. Copie l'URL du webhook

### 2. Ajouter le secret GitHub
1. Va sur ton repo GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Nom : `GOOGLE_CHAT_WEBHOOK`
5. Valeur : colle l'URL du webhook Google Chat
6. Add secret

### 3. C'est tout !
Chaque push sur `main` enverra :
- ✅ Success : "GLesCrocs build SUCCESS on main"
- ❌ Échec : "GLesCrocs build FAILED on main"
