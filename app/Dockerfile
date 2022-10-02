FROM node:16-alpine

RUN npm install -g npm@latest

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
