---
'@malga/tokenization': patch
---

correlating each tokenization with its own response, so concurrent calls no longer share the first token that arrives; the message listener is now removed on every exit path and the promise rejects with a named `TokenizeTimeoutError` when no response ever arrives
