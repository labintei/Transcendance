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

SHELL			:=	/bin/bash

NAME			:=	ft_transcendence

FRONT			:=	./app
BACK			:=	./back

ENV				:=	.env
SECRETENV		:=	.secrets.env
HOSTNAMEENV		:=	.hostname.env

all				:	$(NAME)

$(NAME)			:	stop
	docker-compose up --build || exit 0

stop			:	hostname varcheck
	docker-compose down

varcheck		:
	@[ -f $(ENV) ] || (echo "$(ENV) not found" && exit 1)
	@source $(ENV) && [ ! -z $$WEBSITE_PORT ] || (echo "error : env variable WEBSITE_PORT is not set" && exit 1)
	@source $(ENV) && [ ! -z $$ADMINER_PORT ] || (echo "error : env variable ADMINER_PORT is not set" && exit 1)
	@source $(ENV) && [ ! -z $$POSTGRES_DB ] || (echo "error : env variable POSTGRES_DB is not set" && exit 1)
	@source $(ENV) && [ ! -z $$POSTGRES_USER ] || (echo "error : env variable POSTGRES_USER is not set" && exit 1)
	@source $(ENV) && [ ! -z $$POSTGRES_PASSWORD ] || (echo "error : env variable POSTGRES_PASSWORD is not set" && exit 1)
	@[ -f $(SECRETENV) ] || (echo -e "$(SECRETENV) not found" && exit 1)
	@source $(SECRETENV) && [ ! -z $$API42_UID ] || (echo "error : env variable API42_UID is not set" && exit 1)
	@source $(SECRETENV) && [ ! -z $$API42_SECRET ] || (echo "error : env variable API42_SECRET is not set" && exit 1)

ip				:
	@hostname -I | cut -d' ' -f1

hostname		:
	@echo "REACT_APP_SERVER_HOSTNAME=$(shell hostname)" > .hostname.env

clean			:	stop
	docker system prune --volumes -f

fclean			:	clean
	docker system prune -af

re				:	clean all

fre				:	fclean all

list			:
	@printf "\n\tcontainers\n"
	@docker ps -a
	@printf "\n\timages\n"
	@docker images -a
	@printf "\n\tnetworks\n"
	@docker network ls
	@printf "\n\tvolumes\n"
	@docker volume ls
	@echo ;

.PHONY			:	all $(NAME) stop varcheck ip hostname clean fclean re fre list
