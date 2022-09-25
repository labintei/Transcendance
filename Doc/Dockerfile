FROM node:16

#WORKDIR /usr/src/app # sera dans node par default

#COPY ./app ./src_front

COPY ./app /usr/src/app

COPY ./app/package.json package.json

# voir pour installer les script react

RUN	apt-get -y update && \
	apt-get -y upgrade && \
	npm install -g npm@8.19.2 && \
	npm install --save react react-dom react-scripts

WORKDIR /usr/src/app/src

#RUN	npx create-react-app my-app 
#&& \
#	npm start

	# Si ne marche pas ecrit juste les commondes utiliser

CMD ["npm", "start"]

#CMD ["bin/bash"]
