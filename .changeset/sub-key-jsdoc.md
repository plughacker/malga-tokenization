---
'@malga/tokenization': patch
---

Document in the README and in JSDoc (`apiKey`, constructor and `tokenize()`) that the SDK must receive a short-lived sub-key with the `tokens` scope, created by your backend for each checkout session, never your secret key.
