FROM node:20-alpine

RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /app/models /tmp/uploads /var/log && \
    touch /var/log/ai-diagnostics.log && \
    chmod 666 /var/log/ai-diagnostics.log && \
    chmod 755 /tmp/uploads

EXPOSE 8085

CMD ["npm", "start"]
