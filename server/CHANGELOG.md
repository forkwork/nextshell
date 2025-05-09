### v0.3.7 (April 5, 2024)

- **Features**:
  - Add ecc private key support to `tls()` config.
- **Fixes**:
  - Several dependency upgrades.

### v0.3.6 (September 27, 2023)

- **Features**:
  - Add ability to pass `None` to `multipart::form().max_length()`.
  - Implement `Reply` for `Result<impl Reply, impl Reply>`.
  - Make `multipart::Part::content_type()` return the full mime string.
  - Add `TlsServer::try_bind_with_graceful_shutdown()`.
- **Fixes**:
  - Updated tungstenite and rustls dependencies for security fixes.

### v0.3.5 (April 28, 2023)

- **Fixes**:
  - `multipart` filters now use `multer` dependency, fixing some streaming bugs.
  - `Rejection::into_response()` is significantly faster.

### v0.3.4 (March 31, 2023)

- **Fixes**:
  - `multipart::Part` data is now streamed instead of buffered.
  - Update dependency used for `multipart` filters.

### v0.3.3 (September 27, 2022)

- **Fixes**:
  - Fix `fs` filters path sanitization to reject colons on Windows.

### v0.3.2 (November 9, 2021)

- **Features**:
  - Add `Filter::then()`, which is like `Filter::map()` in that it's infallible, but is async like `Filter::and_then()`.
  - Add `redirect::found()` reply helper that returns `302 Found`.
  - Add `compression-brotli` and `compression-gzip` cargo features to enable only the compression you need.
  - Allow `HEAD` requests to be served to `fs::dir()` filters.
  - Allow `path!()` with no arguments.
- **Fixes**:
  - Update private dependencies Tungstenite and Multipart.
  - Replaces uses of `futures` with `futures-util`, which is a smaller dependency.


### v0.3.1 (March 24, 2021)

- **Features**:
  - Add `pong` constructor to websocket messages.
  - Add `redirect::see_other` and `redirect::permanent` helpers.
- **Fixes**:
  - Fix `fs` filters sometimes having an off-by-one error with range requests.
  - Fix CORS to allow spaces when checking `Access-Control-Request-Headers`.

## v0.3.0 (January 19, 2021)

- **Features**:
  - Add TLS client authentication support.
  - Add TLS OCSP stapling support.
  - Add `From<Reject>` for `Rejection`.
  - Add `close_frame` accessor to `ws::Message`.
- **Changes**:
  - Update to Tokio v1.
  - Update to Bytes v1.
  - Update to hyper v0.14.
  - Rework `sse` filter to be more like `ws`, with a single `Event` type and builder.
  - Change `cookie` filter to extract a generic `FromStr` value.


### v0.2.5 (August 31, 2020)

- **Features**:
  - Add `wrap_fn`, which can be used to create a `Wrap` from a closure. These in turn are used with `Filter::with()`.
  - Add `nextshell::host` filters to deal with `Host`/`:authority` headers.
  - Relax some lifetime bounds on `Server`.
- **Fixes**:
  - Fix panic when URI doesn't have a slash (for example, `CONNECT foo.bar`).

### v0.2.4 (July 20, 2020)

- **Features**:
  - Add `tracing` internals in place of `log` (log is still emitted for backwards compatibility).
  - Add `nextshell::trace` module set of filters to customize `tracing` dianostics.
  - Add `path` method to `nextshell::fs::File` reply.
  - Add `source` implementation for `BodyDeserializeError`.
  - Make `nextshell::ws::MissingConnectionUpgrade` rejection public.

### v0.2.3 (May 19, 2020)

- **Features**:
  - Add `nextshell::compression` filters, which will compress response bodies.
  - Add `nextshell::header::value()` filter to get a request `HeaderValue`.
  - Add `request_headers` method to `nextshell::log::Info`.
  - Add `max_frame_size` to `nextshell::ws::Ws` builder.
  - Add `remote_addr` to `nextshell::test::RequestBuilder`.
  - Add `try_bind_with_graceful_shutdown` to `nextshell::Server` builder.
  - Add `serve_incoming_with_graceful_shutdown` to `nextshell::Server` builder.
- **Fixes**:
  - Fix `nextshell::addr::remote` when used with `Server::tls`.
  - Fix panic in `nextshell::path::{peek, tail, full}` filters when the request URI is in authority-form or asterisk-form.

### v0.2.2 (March 3, 2020)

- **Features**:
  - Implement `Reply` for all `Box<T>` where `T: Reply`.
  - Add `name` methods to `MissingHeader`, `InvalidHeader`, and `MissingCookie` rejections.
  - Add `nextshell::ext::optional()` filter that optionally retrieves an extension from the request.
- **Fixes**:
  - Fix the sending of pings when a user sends a `ws::Message::ping()`.

### v0.2.1 (January 23, 2020)

- **Features**:
  - Add `close` and `close_with` constructors to `nextshell::ws::Message`.
- **Fixes**:
  - Fix `nextshell::fs` filters using a very small read buffer.

## v0.2.0 (January 16, 2020)

- **Features**:
  - Update to `std::future`, adding `async`/`await` support!
  - Add `nextshell::service()` to convert a `Filter` into a `tower::Service`.
  - Implement `Reply` for `Box<dyn Reply>`.
- **Changes**:
  - Refactored Rejection system (#311).
  - Change `path!` macro to assume a `path::end()` by default, with explicit `/ ..` to allow building a prefix (#359).
  - Change `nextshell::path(str)` to accept any `AsRef<str>` argument.
  - Rename "2"-suffixed filters and types (`get2` to `get`, `ws2` to `ws`, etc).
  - `Filter::{or, or_else, recover}` now require `Self::Error=Rejection`. This helps catch filters that didn't make sense (like `nextshell::any().or(nextshell::get())`).
  - Change several `nextshell::body` filters (#345).
  - Change `nextshell::cors()` to return a `nextshell::cors::Builder` which still implements `Wrap`, but can also `build` a cheaper-to-clone wrapper.
  - Change `nextshell::multipart` stream API to allow for errors when streaming.
  - Change `nextshell::sse` to no longer return a `Filter`, adds `nextshell::sse::reply` to do what `Sse::reply` did.
  - Change `Server::tls()` to return a TLS server builder (#340).
  - Change internal `nextshell::never::Never` usage with `std::convert::Infallible`.
  - Remove `nextshell::ext::set()` function (#222).
  - Remove deprecated `nextshell::cookie::optional_value()`.


### v0.1.20 (September 17, 2019)

- **Features**:
  - Implement `Clone` for the `nextshell::cors` filter.
  - Add `into_bytes` method for `nextshell::ws::Message`.

### v0.1.19 (August 16, 2019)

- **Features**:
  - Make `nextshell::multipart` and `wrap::ws` support optional, though enabled by default.
- **Fixes**:
  - Fix `nextshell::fs::dir` filter to reject paths containing backslashes.

### v0.1.18 (July 25, 2019)

- **Features**:
  - Add `nextshell::multipart` support.

### v0.1.17 (July 8, 2019)

- **Features**:
  - Export all built-in Rejection causes in the `nextshell::reject` module.
  - Add `Server::try_bind` as fallible bind methods.

### v0.1.16 (June 11, 2019)

- **Features**:
  - Unseal the `Reply` trait: custom types can now implement `Reply`.
  - Add `nextshell::sse::keep_alive()` replacement for `nextshell::sse::keep()` which allows customizing keep-alive behavior.
  - Add `nextshell::log::Info::host()` accessor.
- **Fixes**:
  - Fix `nextshell::fs` filters from sending some headers for `304` responses.

### v0.1.15 (April 2, 2019)

- **Features**:
  - Add more accessors to `nextshell::log::Info` type for building custom log formats.
  - Implement `Reply` for `Cow<'static, str>`.

### v0.1.14 (March 19, 2019)

- **Features**:
  - Add `nextshell::header::optional` filter.

### v0.1.13 (February 13, 2019)

- **Features**:
  - Implement `Reply` for `Vec<u8>` and `&'static [u8]`.
  - Set `content-type` header automatically for string and bytes replies.
  - Add `expose_headers` to `nextshell::cors` filter.

### v0.1.12 (January 29, 2019)

- **Features**:
  - Implement `PartialEq`, `Eq`, and `Clone` for `nextshell::ws::Message`.
- **Fixes**:
  - Fix panic when incoming request URI may not have a path (such as `CONNECT` requests).

### v0.1.11 (January 14, 2019)

- **Features**:
  - Add `nextshell::sse` filters for handling Server-Sent-Events.
  - Add `allow_headers` to `nextshell::cors` filter.
- **Fixes**:
  - Fix TLS handshake to close the connection if handshake fails.

### v0.1.10 (December 17, 2018)

- **Features**:
  - Add optional TLS support. Enable the `tls` feature, and then use `Server::tls`.
  - Add `nextshell::cors` filter for CORS support.
  - Add `nextshell::addr::remote` to access the remote address of a request.
  - Add `nextshell::log::custom` to support customizing of access logging.
  - Add `nextshell::test::ws` to improve testing Websocket filters.

### v0.1.9 (October 30, 2018)

- **Features**:
  - Add `nextshell::ext::get` and `nextshell::ext::set` to set request extensions.
  - Add `Filter::untuple_one` to unroll nested tuple layers from extractions.
  - Add `Ws2::max_send_queue` configuration method.
  - Add `ws::Message::is_ping` method, and yield pings to user code.
- **Fixes**:
  - Fix panic in debug mode when receiving a websocket ping.

### v0.1.8 (October 25, 2018)

- **Features**:
  - Improved flexibility of `Rejection` system.
    
    The `Rejection` type can now nest and combine arbitrary rejections,
    so it is no longer bound to a small set of meanings. The ranking of
    status codes is still used to determine which rejection gets priority.
    
    A different priority can be implemented by handling rejections with
    a `Filter::recover`, and searching for causes in order via
    `Rejection::find_cause`.
    - Adds `nextshell::reject::custom()` to create a `Rejection` with
      any `Into<Box<std::error::Error>>`. These rejections should be
      handled with an eventual `Filter::recover`. Any unhandled
      custom rejections are considered a server error.
    - Deprecates `Rejection::with`. Use custom rejections instead.
    - Deprecates `Rejection::into_cause`, as it can no longer work. Always
      returns `Err(Rejection)`.
    - Deprecates `Rejection::json`, since the format needed is too generic.
      The `errors.rs` example shows how to send custom JSON when recovering
      from rejections.
    - Deprecates `nextshell::reject()`, since it current signals a `400 Bad
      Request`, but in newer versions, it will signal `404 Not Found`.
      It's deprecated simply to warn that the semantics are changing,
      but the function won't actually go away.
    - Deprecates `reject::bad_request()`, `reject::forbidden()`, and
      `reject::server_error()`. Uses custom rejections instead.
  - Renamed `nextshell::path::index` to `nextshell::path::end`.


### v0.1.7 (October 15, 2018)

- **Features**:
  - Export the types returned from the `nextshell::body::stream()` filter, `BodyStream` and `StreamBuf`.
  - Deprecated `Rejection::into_cause`, since an upcoming Rejection refactor will make it impossible to support.

- **Fixes**:
  - Fix websocket filters to do a case-insensitive match of the `Connection` header.

### v0.1.6 (October 5, 2018)

- **Features**:
  - Add Conditional and Range request support for `nextshell::fs` filters.
  - Relaxed bounds on `Rejection::with` to no longer need to be `Sized`.
  - Add `nextshell::path::peek()` which gets the unmatched tail without adjusting the currently matched path.

### v0.1.5 (October 3, 2018)

- **Features**:
  - Serve `index.html` automatically with `nextshell::fs::dir` filter.
  - Include `last-modified` header with `nextshell::fs` filters.
  - Add `nextshell::redirect` to easily reply with redirections.
  - Add `nextshell::reply::{with_status, with_header}` to wrap `impl Reply`s directly with a new status code or header.
  - Add support for running a nextshell `Server` with a custom source of incoming connections.
    - `Server::run_incoming` to have the runtime started automatically.
    - `Server::serve_incoming` to get a future to run on existing runtime.
    - These can be used to support Unix Domain Sockets, TLS, and other transports.
  - Add `Rejection::into_cause()` to retrieve the original error of a rejection back.
  - Add `Rejection::json()` to convert a rejection into a JSON response.

- **Fixes**
  - Internal errors in nextshell that result in rendering a `500 Internal Server Error` are now also logged at the `error` level.


### v0.1.4 (September 25, 2018)

- **Features**:
  - Add `nextshell::reply::with::headers(HeaderMap)` filter wrapper.
  - Add `nextshell::cookie::optional()` to get an optional cookie value.
  - Add `nextshell::path::full()` to be able to extract the full request path without affecting route matching.
  - Add graceful shutdown support to the `Server`.
  - Allow empty query strings to be treated as for `nextshell::query()`.

### v0.1.3 (August 28, 2018)

- **Features**:
  - Add `nextshell::reject::forbidden()` to represent `403 Forbidden` responses.
  - Add `Rejection::with(cause)` to customize rejection messages.
- **Fixes**:
  - Fix `nextshell::body::form` to allow charsets in the `content-type` header.

### v0.1.2 (August 14, 2018)

- **Features**:
  - Implemented `Reply` for `Response<impl Into<hyper::Body>`, allowing streaming response bodies.
  - Add `nextshell::body::stream()` filter to access the request body as an `impl Stream`.
  - Add `nextshell::ws2()` as a more flexible websocket filter.
    - This allows passing other extracted values to the upgrade callback, such as a value from a header or path.
    - Deprecates `nextshell::ws()`, and `ws2()` will become `ws()` in 0.2.
  - Add `nextshell::get2()`, `nextshell::post2()`, `nextshell::put2()`, and `nextshell::delete2()` as more standard method filters that are used via chaining instead of nesting.
    - `get()`, `post()`, `put()`, and `delete()` are deprecated, and the new versions will become them in 0.2.
  - Add `Filter::unify()` for when a filter returns `Either<T, T>`, converting the `Either` into the inner `T`, regardless of which variant it was.
    - This requires that both sides of the `Either` be the same type.
    - This can be useful when extracting a value that might be present in different places of the request.
      
      ```rust
      // Allow `MyId` to be a path parameter or a header...
      let id = nextshell::path::param::<MyId>()
          .or(nextshell::header::<MyId>())
          .unify();
      
      // A way of providing default values...
      let dnt = nextshell::header::<bool>("dnt")
          .or(nextshell::any().map(|| true))
          .unify();
      ```
  - Add `content-type` header automatically to replies from `file` and `dir` filters based on file extension.
  - Add `nextshell::head()`, `nextshell::options()`, and `nextshell::patch()` as new Method filters.
  - Try to use OS blocksize in `nextshell::fs` filters.
- **Fixes**:
  - Chaining filters that try to consume the request body will log that the body is already consumed, and return a `500 Internal Server Error` rejection.

### v0.1.1 (August 7, 2018)

- **Features**:
  - Add `nextshell::query::raw()` filter to get query as a `String`.
  - Add `Filter::recover()` to ease customizing of rejected responses.
  - Add `nextshell::header::headers_clone()` filter to get a clone of request's `HeaderMap`.
  - Add `nextshell::path::tail()` filter to get remaining "tail" of the request path.
- **Fixes**:
  - URL decode path segments in `nextshell::fs` filters.


## v0.1.0 (August 1, 2018)

- Initial release.
