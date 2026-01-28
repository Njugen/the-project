FROM node:alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client bash

COPY . .

CMD ["bash", "script.sh"]
