FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build --configuration production

RUN apk add --no-cache brotli gzip && \
    cd dist/CardCollector/browser && \
    find . -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -k -9 {} \; && \
    find . -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec brotli -f -q 11 {} \;

# RUN apk add --no-cache gzip && \
#      cd dist/CardCollector/browser && \
#      find . -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -k -9 {} \;


FROM fholzer/nginx-brotli:latest AS client
#FROM nginx:alpine

COPY --from=builder /app/dist/CardCollector/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
