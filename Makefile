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

$(NAME)				:	stop envcheck
	docker-compose up --build || exit 0

dev						: stop envcheck
	docker-compose -f docker-compose.dev.yml up || exit 0

stop				:
	docker-compose down

package-rebuild		:	stop
	@-rm $(BACK)/package-lock.json
	@-rm $(FRONT)/package-lock.json
	docker-compose up --build --no-start back front
	docker cp back:/app/package-lock.json $(BACK)/package-lock.json
	docker cp front:/app/package-lock.json $(FRONT)/package-lock.json

envcheck			:
	@[ -f .env ] || (echo ".env not found" && exit 1)
	@source .env && exit_status=0;				\
	[ ! -z $$WEBSITE_PORT ] || (echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)]	: env variable WEBSITE_PORT is not set" && exit 1) || exit_status=1;			\
	[ ! -z $$ADMINER_PORT ] || (echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)]	: env variable ADMINER_PORT is not set" && exit 1) || exit_status=1;			\
	[ ! -z $$POSTGRES_DB ] || (echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)]	: env variable POSTGRES_DB is not set" && exit 1) || exit_status=1;					\
	[ ! -z $$POSTGRES_USER ] || (echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)]	: env variable POSTGRES_USER is not set" && exit 1) || exit_status=1;			\
	[ ! -z $$POSTGRES_PASSWORD ] || (echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)]	: env variable POSTGRES_PASSWORD is not set" && exit 1) || exit_status=1;	\
	[ ! -z $$API42_UID ] || (echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)]	: env variable API42_UID is not set" && exit 1) || exit_status=1;					\
	[ ! -z $$API42_SECRET ] || (echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)]	: env variable API42_SECRET is not set" && exit 1) || exit_status=1;			\
	[ $$exit_status -eq 1 ] && exit 1;			\
	[ $$WEBSITE_PORT -gt 1024 ] || echo "[$(shell tput setaf 3)WARN$(shell tput sgr0)]	: env variable WEBSITE_PORT ($$WEBSITE_PORT) is <= 1024 and this port cannot be open on cluster sessions"

ip					:
	@hostname -I | cut -d' ' -f1

hostname			:	envcheck
	@echo "REACT_APP_WEBSITE_HOSTNAME=$(shell hostname)" > .hostname.env
	@source .env && echo "REACT_APP_WEBSITE_PORT=$$WEBSITE_PORT" >> .hostname.env
	@echo "REACT_APP_WEBSITE_BASE_URL=http://$(shell hostname)$(shell source .env && [ "$$WEBSITE_PORT" != "80" ] && echo ":$$WEBSITE_PORT")/" >> .hostname.env
	@source .hostname.env && echo "Website URL : $$REACT_APP_WEBSITE_BASE_URL"

clean				:	stop
	rm -rf $(FRONT)/node_modules
	rm -rf $(BACK)/node_modules
	rm -rf $(BACK)/dist
	docker system prune -af

fclean				:	clean
	docker volume prune -f
#	docker volume rm $(shell docker volume ls -q) 2>> /dev/null || exit 0

re					:	clean all

fre					:	fclean all

list				:
	@printf "\n	containers\n"
	@docker ps -a
	@printf "\n	images\n"
	@docker images -a
	@printf "\n	networks\n"
	@docker network ls
	@printf "\n	volumes\n"
	@docker volume ls
	@echo ;

.PHONY				:	all $(NAME) dev dev-db dev-back dev-front stop package-rebuild varcheck ip hostname clean fclean re fre list
