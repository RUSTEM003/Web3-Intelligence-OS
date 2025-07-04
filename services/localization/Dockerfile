FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /app/locales /var/log && \
    touch /var/log/localization.log && \
    chmod 666 /var/log/localization.log

EXPOSE 8086

CMD ["npm", "start"]
