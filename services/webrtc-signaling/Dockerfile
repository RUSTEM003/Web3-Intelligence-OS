FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /var/log && \
    touch /var/log/webrtc-signaling.log && \
    chmod 666 /var/log/webrtc-signaling.log

EXPOSE 8084

CMD ["npm", "start"]
