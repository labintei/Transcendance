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

NAME =	ft_transcendence

FRONT =	./app
BACK =	./back

ENV =			.env
SECRETENV =		.secret.env
HOSTNAMEENV =	.hostname.env

SHELL := bash

all:	$(NAME)

$(NAME):	hostname stop
	@[ -f $(SECRETENV) ] || echo -e "$(SECRETENV) not found"
	@[ -f $(ENV) ] || echo -e "$(ENV) not found"
	docker-compose up --force-recreate --build || exit 0

ip:
	@hostname -I | cut -d' ' -f1

hostname:
	@echo "REACT_APP_SERVER_HOSTNAME=$(shell hostname)" > .hostname.env
	@echo "Website address : http://$$(hostname):3001/"

stop:
	docker-compose down

clean:	stop
	docker system prune --volumes -f

fclean: clean
	docker system prune -af

re:		clean all

fre:	fclean all

list:
	@printf "\n\tcontainers\n"
	@docker ps -a
	@printf "\n\timages\n"
	@docker images -a
	@printf "\n\tnetworks\n"
	@docker network ls
	@printf "\n\tvolumes\n"
	@docker volume ls
	@echo ;

.PHONY: all ip hostname stop clean fclean re fre list
