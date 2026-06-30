# DevShop 🛒⚡

Boutique digitale moderne — Next.js 14, TypeScript, Prisma, PostgreSQL, NOWPayments, Cloudinary.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom cyber design system
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (credentials)
- **Payments**: NOWPayments (USDT TRC-20 + 300+ cryptos)
- **Storage**: Cloudinary (images + files)
- **i18n**: next-intl (EN/FR, English priority)
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Features

✅ Boutique multi-produits (template, plugin, SaaS, ebook, course)  
✅ Paiement crypto via NOWPayments  
✅ Livraison automatique par email après paiement  
✅ Liens de téléchargement sécurisés (expiration configurable)  
✅ Dashboard admin complet (produits, commandes, clients)  
✅ Super-admin via env (pas via inscription)  
✅ Dark/Light mode avec animation  
✅ EN/FR (switch dynamique)  
✅ Responsive PC/iPad/tablette/mobile  
✅ SEO optimisé (metadata, OG, sitemap, robots)  

## Setup

### 1. Cloner et installer

```bash
git clone <repo>
cd devshop
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env
```

Remplir toutes les variables dans `.env`.

### 3. Base de données

```bash
npx prisma migrate dev --name init
npm run seed
```

### 4. Développement

```bash
npm run dev
```

## Déploiement Vercel — Checklist complète

### 1. Prérequis externes (à créer AVANT de déployer)

- **Base de données PostgreSQL** : [Neon](https://neon.tech) (gratuit, recommandé) ou Supabase. Récupère l'URL de connexion **poolée** (important pour serverless).
- **Compte NOWPayments** : crée un compte, récupère `API_KEY`, active l'IPN et récupère `IPN_SECRET`.
- **Compte Cloudinary** : plan gratuit (25GB), récupère `cloud_name`, `api_key`, `api_secret` depuis le Dashboard.
- **SMTP** (optionnel mais recommandé) : Gmail avec mot de passe d'application, ou service comme Resend/SendGrid.

### 2. Déployer

```bash
# Pousser le code sur GitHub d'abord
git init
git add .
git commit -m "Initial commit"
git remote add origin <ton-repo-github>
git push -u origin main

# Puis sur vercel.com : "Import Project" → connecter le repo GitHub
```

Ou en CLI :
```bash
npm i -g vercel
vercel --prod
```

### 3. Variables d'environnement sur Vercel (Settings → Environment Variables)

Ajoute **toutes** les variables de `.env.example`, avec ces valeurs précises pour la prod :

| Variable | Valeur en production |
|---|---|
| `DATABASE_URL` | URL Neon/Supabase **poolée** (pas localhost) |
| `NEXTAUTH_URL` | `https://ton-projet.vercel.app` (ton vrai domaine) |
| `NEXTAUTH_SECRET` | Généré via `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Même valeur que `NEXTAUTH_URL` |
| `ADMIN_EMAIL` | Ton email admin |
| `ADMIN_PASSWORD` | Mot de passe fort (utilisé seulement pour le seed) |

⚠️ **Sans ces variables correctement configurées, le build échoue ou l'app plante en prod.**

### 4. Après le premier déploiement

```bash
# Connecte-toi à ta base de prod et lance les migrations
npx prisma migrate deploy
npm run seed
```

Ou configure ça comme "Build Command" sur Vercel : `prisma generate && prisma migrate deploy && next build`

### 5. Configurer le webhook NOWPayments

Dans le dashboard NOWPayments → Settings → IPN :
```
https://ton-projet.vercel.app/api/webhook/nowpayments
```

### 6. Vérifications post-déploiement

- [ ] La homepage charge (`/` redirige vers `/en` ou `/fr` automatiquement)
- [ ] Inscription avec `ADMIN_EMAIL` → vérifier que le rôle devient bien `ADMIN`
- [ ] `/admin/dashboard` accessible uniquement en étant connecté en admin
- [ ] Upload d'image dans `/admin/products/new` fonctionne (teste Cloudinary)
- [ ] Un paiement test NOWPayments redirige bien vers `/orders/[id]`
- [ ] L'email de confirmation arrive (teste le SMTP)

### Vérification du build — ce qui a été testé

Le build a été testé dans un environnement sandbox avec accès réseau restreint (pas d'accès à `binaries.prisma.sh` ni `fonts.googleapis.com`). Deux vrais bugs ont été trouvés et corrigés grâce à ce test :

1. **Import CSS cassé** : `app/[locale]/layout.tsx` importait `'./globals.css'` au lieu de `'../globals.css'` (le fichier est à la racine `app/`, pas dans `app/[locale]/`). Corrigé.
2. **`app/not-found.tsx` sans root layout** : Next.js exige qu'un `not-found.tsx` à la racine `app/` soit accompagné d'un `layout.tsx` au même niveau. Le vrai layout vivant dans `app/[locale]/layout.tsx`, ce fichier racine cassait le build. Supprimé — `app/[locale]/not-found.tsx` (qui hérite correctement du layout) suffit pour gérer les 404 internes à l'application.

**Ce qui n'a PAS pu être testé ici** (bloqué par le réseau sandbox, à vérifier sur ta machine ou sur Vercel) :
- Téléchargement des fonts Google (`Inter`, `Syne`, `JetBrains Mono`) — fonctionnera normalement avec un accès internet standard.
- Génération du client Prisma (`prisma generate`) — fonctionnera normalement avec un accès internet standard.
- Le build complet de bout en bout avec un vrai `DATABASE_URL`.

**Recommandation** : avant de déployer sur Vercel, lance `npm run build` en local sur ta machine pour confirmer que tout compile avec un accès réseau complet. Si une erreur apparaît que je n'ai pas pu anticiper depuis mon environnement, partage-la-moi telle quelle et je la corrige.

### Limites du plan Vercel gratuit (Hobby)

- Timeout serverless : 10s par défaut. `vercel.json` configure 30s sur les routes paiement/webhook, mais ça **nécessite le plan Pro** pour être appliqué (sur Hobby, le timeout reste plafonné à 10s).
- Si les webhooks NOWPayments timeout sous charge, upgrade vers Vercel Pro.
- **Taille des requêtes : 4.5MB max** sur les fonctions serverless (Hobby et Pro). L'upload `/api/upload` (image produit) va échouer pour tout fichier dépassant cette taille, **même si Cloudinary accepterait plus**. Pour les images, reste sous 4MB. Pour les gros fichiers produits (ZIP, etc.), utilise le champ "Lien externe" avec GitHub Releases comme déjà discuté — ne passe jamais par `/api/upload`.


## Structure

```
app/
  [locale]/
    (shop)/          # Pages publiques (navbar + footer)
      page.tsx       # Homepage
      products/      # Liste + détail produits
      cart/          # Panier
      checkout/      # Paiement
      orders/        # Commandes utilisateur
      auth/          # Login + Register
    admin/           # Dashboard admin (sidebar séparé)
      dashboard/
      products/
      orders/
      customers/
      settings/
  api/
    auth/            # NextAuth + register
    products/        # CRUD produits
    orders/          # Création commandes
    webhook/         # NOWPayments IPN
    download/        # Téléchargement sécurisé
    upload/          # Upload Cloudinary (admin only)

components/
  layout/            # Navbar, Footer, Providers
  shop/              # Composants boutique
  admin/             # Composants admin
  ui/                # Toaster

lib/
  prisma.ts          # Client Prisma singleton
  auth.ts            # NextAuth config
  nowpayments.ts     # API NOWPayments
  cloudinary.ts      # Upload/download Cloudinary
  email.ts           # Nodemailer
  utils.ts           # Helpers

prisma/
  schema.prisma      # Modèles DB
  seed.ts            # Données initiales
```

## Admin

L'admin est défini par `ADMIN_EMAIL` dans `.env`. Toute inscription avec cet email obtient automatiquement le rôle `ADMIN`.

Dashboard accessible sur `/admin/dashboard`.

## Webhook NOWPayments

1. Aller dans le dashboard NOWPayments
2. Configurer l'IPN URL: `https://votre-domaine.com/api/webhook/nowpayments`
3. Copier le secret IPN dans `NOWPAYMENTS_IPN_SECRET`
