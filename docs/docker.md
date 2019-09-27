# Docker

## Prepare the Docker service

In your docker installation's configuration, increase the amount of active memory allotted to the instance to 4GB.

## Build Parsr

Inside the root directory of the project, launch:

`docker-compose build`

This will build Parsr, along with its dependencies.

## Run Parsr

- In the root of the repository, execute:

`docker-compose up`

Note: A docker volume will be created at first launch so that the data will be kept at containers restart.
