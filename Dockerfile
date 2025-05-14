# ------------------------------------------------------------------------------
# This Dockerfile uses a multi-stage approach so it can be used both for local development and CI
#  - Prod image size remains small by not including dev code and dev dependencies
#  - Prod image contains no secrets
#  - Dev image extends the prod base by including all dev dependencies and exposing debugging ports
# ------------------------------------------------------------------------------

FROM node:16.20.2 AS base

# switch to lesser priviledged node user
USER node

# create and switch to /home/node/app folder
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# ------------------------------------------------------------------------------
FROM base AS prod-deps

# Copy read only ssh key and config files for root user.
# NOTE: this could be passed as an ARG from Rancher/Jenkins secrets rather than committed to the repo
COPY --chown=node:node build/ssh-key/ /home/node/.ssh/
RUN chmod -R 700 /home/node/.ssh

# Copy over local lib packages for npm install
COPY --chown=node:node lib/ ./lib

# npm install production dependencies first to use node cache
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --only=production

# ------------------------------------------------------------------------------
FROM prod-deps AS dev

# install all dependencies so we can generate webpack bundles and we can run tests
RUN npm ci

# copy all files
COPY --chown=node:node . .

# Ensure wait-for-it is executable
RUN chmod +x ./bin/wait-for-it.sh

# Allow Node debugging port to be exposed
ENV DEBUG=5858
EXPOSE $DEBUG

# ------------------------------------------------------------------------------
FROM dev AS bundles

# generate production webpack bundles
RUN npm run webpack -- --mode production

# ------------------------------------------------------------------------------
FROM prod-deps AS prod-files

# copy the rest of the files
COPY --chown=node:node . .

# remove non-prod code/files
# NOTE: the important part is to remove /build/ssh-keys. Removing client/test is done mainly to keep images small
RUN rm -rf ./build ./test ./client

# ------------------------------------------------------------------------------
FROM base AS prod

# copy the prod dependencies and source code
COPY --from=prod-files /home/node/app ./

# Copy over generated webpack bundle
COPY --from=bundles  /home/node/app/wwwroot ./wwwroot

# start the site as the default command
ENV PORT=9001
EXPOSE $PORT
CMD npm start

# Keep track of hash so we know exactly what code is running
ARG GIT_COMMIT=latest
ENV GIT_COMMIT $GIT_COMMIT
