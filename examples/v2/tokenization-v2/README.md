# Tokenization v2 example

React example of `@malga/tokenization` with a small backend that creates a short-lived sub-key for each checkout session.

- `server.mjs` calls `POST /v1/auth` with your secret key and returns only a sub-key with scope `["tokens"]` and `expires: 900` (15 minutes).
- `src/App.tsx` fetches that sub-key when the checkout mounts, only then creates the `MalgaTokenization` instance, and calls `destroy()` when it unmounts.

The secret key stays in the server process. It is never sent to the browser or bundled with the front-end.

## Running

Requires Node 18 or higher.

```bash
npm install

# Terminal 1: backend that creates the sub-key (sandbox by default)
MALGA_CLIENT_ID=YOUR_CLIENT_ID MALGA_SECRET_KEY=YOUR_API_KEY npm run server

# Terminal 2: front-end (proxies /checkout/malga-key to the backend on port 3001)
npm start
```

| Variable           | Description                                              | Default                        |
| ------------------ | -------------------------------------------------------- | ------------------------------ |
| `MALGA_CLIENT_ID`  | Your `X-Client-Id`                                       | required                       |
| `MALGA_SECRET_KEY` | Your secret key (`X-Api-Key`). Used only by `server.mjs` | required                       |
| `MALGA_API_URL`    | `https://sandbox-api.malga.io` or `https://api.malga.io` | `https://sandbox-api.malga.io` |
| `PORT`             | Backend port                                             | `3001`                         |

The example uses `sandbox: true`. For production, set `MALGA_API_URL=https://api.malga.io`, use your production credentials and set `sandbox: false`.

See [Create sub-key](https://docs.malga.io/api-reference/client-token/criar-nova-chave-publica-para-uso-no-client-side) for scopes and expiration values.
