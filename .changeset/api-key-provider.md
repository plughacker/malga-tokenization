---
'@malga/tokenization': minor
---

`apiKey` accepts a function that returns the key (sync or async). It is called on every `tokenize()`, right before the card data is sent, so a short-lived sub-key can be fetched only when needed and renewed without recreating the fields. Passing a string works as before. The function has a 30-second deadline, and the card is only sent if the instance and its fields are still the same, and complete, once the key arrives.
