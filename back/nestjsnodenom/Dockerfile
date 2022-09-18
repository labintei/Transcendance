
FROM debian:buster


RUN apt-get -y update && \
	apt-get -y upgrade && \
	apt-get install -y nodejs && \
	apt-get install -y npm && \
	npm install -y -g nodemon

CMD ["npm", "start"]
