# Railway Deployment

This project should run as two Railway services from the same GitHub repository.

## Services

### 1. `sassai-saas`

This is the site-owned SaaS backend for Creem checkout, webhooks, code pools, and automatic SubRouter activation.

Use the default Railway Node/Nixpacks build. Do not set a Dockerfile path for this service.

Start command:

```bash
npm run saas:server
```

Variables:

```env
PORT=8787
SITE_ADMIN_TOKEN=change_me
SITE_SAAS_STORE=/data/site-saas-store.json
CREEM_API_KEY=creem_key
CREEM_WEBHOOK_SECRET=creem_webhook_secret
SUBROUTER_API_BASE=https://your-saas-domain.com
```

Attach a Railway volume mounted at:

```text
/data
```

The volume keeps the code pool, order records, and subscription records across redeploys.

### 2. `sassai-web`

This is the public frontend gateway. It serves the Vite build with Caddy and proxies API traffic.

Set this service variable so Railway uses the frontend gateway Dockerfile:

```env
RAILWAY_DOCKERFILE_PATH=railway.web.Dockerfile
```

Variables:

```env
SAAS_BACKEND_URL=http://sassai-saas.railway.internal:8787
SUBROUTER_API_BASE=http://subrouter.railway.internal:3000
```

If SubRouter is not deployed inside the same Railway project, use its public backend URL instead:

```env
SUBROUTER_API_BASE=https://your-subrouter-backend.com
```

Bind the custom domain to `sassai-web`, not to `sassai-saas`.

## Routing

`Caddyfile` routes requests like this:

- `/api/site/*` goes to `sassai-saas`.
- `/api/*` goes to SubRouter.
- everything else serves the React SPA from `/srv`, with fallback to `index.html`.

The SubRouter proxy preserves the public request host, so SubRouter can identify the distributor site by domain.

## Site Admin

After deployment, open:

```text
https://your-saas-domain.com/site-admin/saas
```

Use `SITE_ADMIN_TOKEN`, then configure Creem, package mappings, and balance-code pools.

Creem webhook URL:

```text
https://your-saas-domain.com/api/site/saas/webhooks/creem
```
