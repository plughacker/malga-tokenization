---
'@malga/tokenization': major
---

add destroy() to unmount an instance, and refuse containers already used by another live instance (ContainerInUseError) or repeated within one configuration (DuplicatedContainerError)

**Breaking:** creating a new instance on containers still held by another one now throws `ContainerInUseError` (in 4.x it silently stacked a second set of iframes). If your checkout can mount more than once (React `useEffect` without a cleanup, `StrictMode`, navigating back to the route), call `destroy()` when it unmounts.
