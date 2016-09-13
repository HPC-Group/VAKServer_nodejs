NAME=visanalyticskit/vakserver_nodejs
VERSION=0.0.4
CONTAINER=vak_node

.PHONY: build run remove

build:
	docker build -t $(NAME):$(VERSION) --rm .