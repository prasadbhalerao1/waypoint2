# controllers

Thin Express route handlers that translate HTTP requests into service calls before returning JSON responses.

Controllers stay stateless and **never** contain business logic – keep that in `src/services`.
