# Docker

## Prepare the Docker service

In the docker installation's configuration on the host machine, increase the amount of active memory allotted for the instance to 4GB.

## Build the containers

As for now, 2 containers will be built using docker-compose:

- Duckling
- Parsr

To build, them:

- Clone the repository using `git clone`.
- In the root of the repository, execute `docker-compose build`.

## Run Parsr

- In the root of the repository, execute `docker-compose up`

Please note a docker volume will be created at first launch so that data will be kept at containers restart
