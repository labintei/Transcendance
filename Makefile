# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: jraffin <jraffin@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2022/10/01 16:27:27 by jraffin           #+#    #+#              #
#    Updated: 2022/11/21 08:52:42 by jraffin          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

SHELL		:=	/bin/bash

NAME		:=	ft_transcendence

FRONT		:=	./app
BACK		:=	./back

all							:	$(NAME)

#	loads production environment
$(NAME)					:	stop envcheck hostname 
	@docker-compose up --build || exit 0

#	loads development environment
dev							: stop envcheck hostname 
	@docker-compose -f docker-compose.dev.yml up || exit 0

#	loads development backend environment only
dev-back				: stop envcheck hostname
	@docker-compose -f docker-compose.dev.yml up back || exit 0

#	loads development frontend environment only
dev-front				: stop envcheck hostname
	@docker-compose -f docker-compose.dev.yml up front || exit 0=\\n

stop						:
	@docker-compose down --remove-orphans

package-rebuild	:	stop
	@-rm $(BACK)/package-lock.json
	@-rm $(FRONT)/package-lock.json
	docker-compose up --build --no-start back front
	docker cp back:/app/package-lock.json $(BACK)/package-lock.json
	docker cp front:/app/package-lock.json $(FRONT)/package-lock.json

envcreate				:
	@[ ! -f .env ] && echo "[$(shell tput setaf 3)INFO$(shell tput sgr0)]  .env file not found, creating..."	\
	&& echo -e "\n\
	WEBSITE_PORT=$(shell grep '$${WEBSITE_PORT:-.*}' docker-compose.yml | head -1 | sed 's/^.*$${WEBSITE_PORT:-//g;s/}.*$$//g')\n\
	BACKEND_PORT=$(shell grep '$${BACKEND_PORT:-.*}' docker-compose.yml | head -1 | sed 's/^.*$${BACKEND_PORT:-//g;s/}.*$$//g')\n\
	ADMINER_PORT=$(shell grep '$${ADMINER_PORT:-.*}' docker-compose.yml | head -1 | sed 's/^.*$${ADMINER_PORT:-//g;s/}.*$$//g')\n\
	\n\
	POSTGRES_DB=\n\
	POSTGRES_USER=\n\
	POSTGRES_PASSWORD=\n\
	\n\
	API42_UID=\n\
	API42_SECRET=\n\
	" > .env	\
	|| exit 0;

envcheck				:	envcreate
	@source .env 2>>/dev/null; exit_status=0; \
	[ -z $$WEBSITE_PORT ] && echo "[$(shell tput setaf 3)INFO$(shell tput sgr0)]  environment variable WEBSITE_PORT is not set, using default ($(shell grep '$${WEBSITE_PORT:-.*}' docker-compose.yml | head -1 | sed 's/^.*$${WEBSITE_PORT:-//g;s/}.*$$//g'))"	\
		|| ([ $$WEBSITE_PORT -lt 1024 ] && echo "[$(shell tput setaf 3)INFO$(shell tput sgr0)]  environment variable WEBSITE_PORT ($$WEBSITE_PORT) is <= 1024 and this port cannot be open on school42 cluster sessions");		\
	[ -z $$BACKEND_PORT ] && echo "[$(shell tput setaf 3)INFO$(shell tput sgr0)]  environment variable BACKEND_PORT is not set, using default ($(shell grep '$${BACKEND_PORT:-.*}' docker-compose.yml | head -1 | sed 's/^.*$${BACKEND_PORT:-//g;s/}.*$$//g'))"	\
		|| ([ $$BACKEND_PORT -lt 1024 ] && echo "[$(shell tput setaf 3)INFO$(shell tput sgr0)]  environment variable BACKEND_PORT ($$BACKEND_PORT) is <= 1024 and this port cannot be open on school42 cluster sessions");		\
	[ -z $$ADMINER_PORT ] && echo "[$(shell tput setaf 3)INFO$(shell tput sgr0)]  environment variable ADMINER_PORT is not set, using default ($(shell grep '$${ADMINER_PORT:-.*}' docker-compose.yml | head -1 | sed 's/^.*$${ADMINER_PORT:-//g;s/}.*$$//g'))"	\
		|| ([ $$ADMINER_PORT -lt 1024 ] && echo "[$(shell tput setaf 3)INFO$(shell tput sgr0)]  environment variable ADMINER_PORT ($$ADMINER_PORT) is <= 1024 and this port cannot be open on school42 cluster sessions");		\
	[ -z $$POSTGRES_DB ] && echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)] environment variable POSTGRES_DB is not set !" && exit_status=1;	\
	[ -z $$POSTGRES_USER ] && echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)] environment variable POSTGRES_USER is not set !" && exit_status=1;	\
	[ -z $$POSTGRES_PASSWORD ] && echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)] environment variable POSTGRES_PASSWORD is not set !" && exit_status=1;	\
	[ -z $$API42_UID ] && echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)] environment variable API42_UID is not set !" && exit_status=1;	\
	[ -z $$API42_SECRET ] && echo "[$(shell tput setaf 1)ERROR$(shell tput sgr0)] environment variable API42_SECRET is not set !" && exit_status=1;		\
	exit $$exit_status;

ip							:
	@hostname -i

hostname				:
	@sed -i '/^\s*HOSTNAME=/d' ./.env 2>>/dev/null; exit 0
	@echo "HOSTNAME=$(shell hostname -f)" >> .env
	@hostname -f

#	cleans compilated dev data
clean						:	stop
	-rm -rf $(FRONT)/package-lock.json
	-rm -rf $(BACK)/package-lock.json
	-rm -rf $(FRONT)/node_modules
	-rm -rf $(BACK)/node_modules
	-rm -rf $(FRONT)/dist
	-rm -rf $(BACK)/dist

#	cleans container builds
cclean					: stop
	docker system prune -af

#	cleans persistence volumes
pclean					: stop
	docker volume prune -f

#	cleans everything
fclean					:	clean cclean pclean

pdre						: pclean dev

dre							:	fclean dev

re							:	fclean all

list						:
	@printf "\n	containers\n"
	@docker ps -a
	@printf "\n	images\n"
	@docker images -a
	@printf "\n	networks\n"
	@docker network ls
	@printf "\n	volumes\n"
	@docker volume ls
	@echo ;

.PHONY					:	all $(NAME) dev dev-back dev-front stop package-rebuild envcheck ip hostname clean cclean pclean fclean re list
