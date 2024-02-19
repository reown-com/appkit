FROM node:20-bookworm as base


WORKDIR /

# RUN apk --update --no-cache \
#     add g++ make python3

FROM base as build

WORKDIR /

COPY ../ ./
RUN npm ci
RUN npm run build

WORKDIR /apps/laboratory/

RUN npm run playwright:install

CMD ["npm", "run", "playwright:test:canary"]
