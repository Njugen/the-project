FROM node:alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client bash

COPY . .

COPY script.sh /app/script.sh
RUN chmod +x /app/script.sh
CMD ["/app/script.sh"]