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

SHELL				:=	/bin/bash

NAME				:=	ft_transcendence

FRONT				:=	./app
BACK				:=	./back

all					:	$(NAME)

#	loads production environment
$(NAME)				:	stop
	docker-compose up --build || exit 0

#	loads development environment
dev						: stop
	docker-compose -f docker-compose.dev.yml up || exit 0

#	loads development backend environment only
dev-back			: stop
	docker-compose -f docker-compose.dev.yml up back || exit 0

#	loads development frontend environment only
dev-front			: stop
	docker-compose -f docker-compose.dev.yml up front || exit 0

stop					: hostname
	docker-compose down --remove-orphans

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
	@echo "REACT_APP_HOSTNAME=$(shell hostname)" > .hostname.env
	@source .env && echo "REACT_APP_WEBSITE_PORT=$$WEBSITE_PORT" >> .hostname.env
	@source .env && echo "REACT_APP_BACKEND_PORT=$$BACKEND_PORT" >> .hostname.env
	@echo "REACT_APP_WEBSITE_URL=http://$(shell hostname)$(shell source .env && [ "$$WEBSITE_PORT" != "80" ] && echo ":$$WEBSITE_PORT")/" >> .hostname.env
	@echo "REACT_APP_BACKEND_URL=http://$(shell hostname)$(shell source .env && [ "$$BACKEND_PORT" != "80" ] && echo ":$$BACKEND_PORT")/" >> .hostname.env
	@source .hostname.env && echo -e "Backend URL : $$REACT_APP_BACKEND_URL\nWebsite URL : $$REACT_APP_WEBSITE_URL"

#	cleans compilated dev data
clean				:	stop
	-rm -rf $(FRONT)/package-lock.json
	-rm -rf $(BACK)/package-lock.json
	-rm -rf $(FRONT)/node_modules
	-rm -rf $(BACK)/node_modules
	-rm -rf $(FRONT)/dist
	-rm -rf $(BACK)/dist

#	cleans container builds
cclean			: stop
	docker system prune -af

#	cleans persistence volumes
pclean			: stop
	docker volume prune -f

#	cleans everything
fclean			:	clean cclean pclean

re					:	fclean all

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

.PHONY				:	all $(NAME) dev dev-back dev-front stop package-rebuild envcheck ip hostname clean cclean pclean fclean re list
