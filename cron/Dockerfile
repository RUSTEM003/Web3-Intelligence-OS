FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /var/log && \
    touch /var/log/ai-content-generator.log && \
    chmod 666 /var/log/ai-content-generator.log

EXPOSE 3003

CMD ["npm", "start"]
