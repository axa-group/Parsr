# Docker

## Run Parsr

In the root of the repository, launch:

  ```
  docker-compose up
  ```

This will start 2 containers : 
* one for the API listening on http://localhost:3001
* the second one for the demo UI listening on http://localhost:8080

Note: a docker volume will be created at first launch so that the data will be kept at containers restart.


## Build Parsr

If you want to build parsr by yourself, at the root of the project, launch:

  ```
  docker-compose -f docker-compose-build.yml build
  ```

This will build Parsr, along with its dependencies.
