# @malga/tokenization

## 5.0.0

### Major Changes

- [#54](https://github.com/plughacker/malga-tokenization/pull/54) [`19ed292`](https://github.com/plughacker/malga-tokenization/commit/19ed29257b214745a5658b6a0abd3b9965eeae05) Thanks [@milenacrios](https://github.com/milenacrios)! - add destroy() to unmount an instance, and refuse containers already used by another live instance (ContainerInUseError) or repeated within one configuration (DuplicatedContainerError)

  **Breaking:** creating a new instance on containers still held by another one now throws `ContainerInUseError` (in 4.x it silently stacked a second set of iframes). If your checkout can mount more than once (React `useEffect` without a cleanup, `StrictMode`, navigating back to the route), call `destroy()` when it unmounts.

### Minor Changes

- [#54](https://github.com/plughacker/malga-tokenization/pull/54) [`19ed292`](https://github.com/plughacker/malga-tokenization/commit/19ed29257b214745a5658b6a0abd3b9965eeae05) Thanks [@milenacrios](https://github.com/milenacrios)! - tokenize() resolves with an invalid_request_error naming the missing fields, without a request, when a configured field has no value

## 4.0.0

### Major Changes

- [#52](https://github.com/plughacker/malga-tokenization/pull/52) [`f5fb1c8`](https://github.com/plughacker/malga-tokenization/commit/f5fb1c8379bea81c936650c8721bb2ab9ce70859) Thanks [@milenacrios](https://github.com/milenacrios)! - enable tokenization for 2 or more cards

## 3.0.1

### Patch Changes

- [#48](https://github.com/plughacker/malga-tokenization/pull/48) [`8dc8bce`](https://github.com/plughacker/malga-tokenization/commit/8dc8bce93b32e319343ae7c64a3ead69ef68b17b) Thanks [@milenacrios](https://github.com/milenacrios)! - loading the hosted-fields iframe from its versioned path (/2.0.0/index.html)

## 3.0.0

### Major Changes

- [#46](https://github.com/plughacker/malga-tokenization/pull/46) [`72c9ec5`](https://github.com/plughacker/malga-tokenization/commit/72c9ec57b6d083f81d16b323cc2ef19681f8084e) Thanks [@milenacrios](https://github.com/milenacrios)! - fix changeset to deploy releases in malga-tokenization

## 1.0.0

### Major Changes

- refactoring sdk to use hosted fields solution
