FROM node:16-alpine

RUN npm install -g npm@latest
RUN npm i -g @nestjs/cli 

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
