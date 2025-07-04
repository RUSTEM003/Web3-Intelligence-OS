FROM nginx:alpine

RUN apk add --no-cache ffmpeg

COPY nginx-rtmp.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 1935 8080

CMD ["/entrypoint.sh"]
