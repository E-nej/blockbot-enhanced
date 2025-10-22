FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

ENTRYPOINT ["/bin/sh", "-c", "npm run start:dev"]
