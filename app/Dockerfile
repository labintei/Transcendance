FROM node:18-alpine

RUN npm install -g npm@latest

WORKDIR /app

COPY ["package.json", "./"]

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
