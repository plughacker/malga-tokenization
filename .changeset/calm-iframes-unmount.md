---
'@malga/tokenization': minor
---

add destroy() to unmount an instance, and refuse containers already used by another live instance (ContainerInUseError) or repeated within one configuration (DuplicatedContainerError)
