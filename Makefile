# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jraffin <jraffin@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2022/10/01 16:27:27 by jraffin           #+#    #+#              #
#    Updated: 2022/10/01 18:01:26 by jraffin          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

SHELL				:=	/bin/bash

NAME				:=	ft_transcendence

FRONT				:=	./app
BACK				:=	./back

all					:	$(NAME)

$(NAME)				:	stop
	docker-compose up --build || exit 0

dev-db				:	stop
	docker-compose run -p 5432:5432 db

dev-back			:	hostname varcheck
	npm --prefix $(BACK) install
	@source .env && export PORT=3000 DATABASE_HOST=localhost DATABASE_PORT=5432					\
	$(shell sed -e 's/ *#.*$$//' ./.hosname.env) $(shell sed -e 's/ *#.*$$//' ./.secrets.env)	\
	&& npm --prefix $(BACK) run start

dev-front			:	hostname varcheck
	npm --prefix $(FRONT) install
	@source .env && export PORT=$$WEBSITE_PORT $(shell sed -e 's/ *#.*$$//' ./.hosname.env)								\
	&& npm --prefix $(FRONT) run start

stop				:	hostname varcheck
	docker-compose down

package-rebuild		:	stop
	@-rm $(BACK)/package-lock.json
	@-rm $(FRONT)/package-lock.json
	docker-compose create --build back front
	docker cp back:/app/package-lock.json $(BACK)/package-lock.json
	docker cp front:/app/package-lock.json $(FRONT)/package-lock.json

varcheck			:	hostname
	@source .env && [ ! -z $$ADMINER_PORT ] || (echo "error : env variable ADMINER_PORT is not set" && exit 1)
	@source .env && [ ! -z $$POSTGRES_DB ] || (echo "error : env variable POSTGRES_DB is not set" && exit 1)
	@source .env && [ ! -z $$POSTGRES_USER ] || (echo "error : env variable POSTGRES_USER is not set" && exit 1)
	@source .env && [ ! -z $$POSTGRES_PASSWORD ] || (echo "error : env variable POSTGRES_PASSWORD is not set" && exit 1)
	@[ -f .secrets.env ] || (echo -e ".secrets.env not found" && exit 1)
	@source .secrets.env && [ ! -z $$API42_UID ] || (echo "error : env variable API42_UID is not set" && exit 1)
	@source .secrets.env && [ ! -z $$API42_SECRET ] || (echo "error : env variable API42_SECRET is not set" && exit 1)

ip					:
	@hostname -I | cut -d' ' -f1

hostname			:
	@[ -f .env ] || (echo ".env not found" && exit 1)
	@source .env && ([ ! -z $$WEBSITE_PORT ] || (echo "error : env variable WEBSITE_PORT is not set" && exit 1)) 		\
	&& ([ $$WEBSITE_PORT -gt 1024 ] || echo "[$(shell tput setaf 3)WARNING$(shell tput sgr0)] : env variable WEBSITE_PORT ($$WEBSITE_PORT) is <= 1024 and this port cannot be open on cluster sessions")
	@echo "REACT_APP_WEBSITE_HOSTNAME=$(shell hostname)" > .hostname.env
	@source .env && echo "REACT_APP_WEBSITE_PORT=$$WEBSITE_PORT" >> .hostname.env
	@echo "REACT_APP_WEBSITE_BASE_URL=http://$(shell hostname)$(shell source .env && [ "$$WEBSITE_PORT" != "80" ] && echo ":$$WEBSITE_PORT")/" >> .hostname.env

clean				:	stop
	docker system prune --volumes -f

fclean				:	clean
	rm -rf $(FRONT)/node_module
	rm -rf $(BACK)/node_module
	rm -rf $(BACK)/dist
	docker system prune -af

re					:	clean all

fre					:	fclean all

list				:
	@printf "\n\tcontainers\n"
	@docker ps -a
	@printf "\n\timages\n"
	@docker images -a
	@printf "\n\tnetworks\n"
	@docker network ls
	@printf "\n\tvolumes\n"
	@docker volume ls
	@echo ;

.PHONY				:	all $(NAME) dev-db dev-back dev-front stop package-rebuild varcheck ip hostname clean fclean re fre list
