FROM caddy:builder AS builder

# Add the Cloudflare plugin
RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare

FROM caddy:latest

# Copy the custom binary over the standard one
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
