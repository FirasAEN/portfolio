# syntax=docker/dockerfile:1
#
# Two stages: node builds the static site, nginx serves it. The runtime image
# carries no node, no source and no node_modules — only dist/ and a config.
#
# The site's origin is baked in at BUILD time (canonical, og:, sitemap,
# JSON-LD), so DEPLOY_TARGET is a build arg and not a runtime env var. Changing
# the host means rebuilding the image, not restarting the container.

FROM node:22-alpine AS build
WORKDIR /app

# package files first, so `npm ci` is only re-run when dependencies change and
# not on every source edit.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG DEPLOY_TARGET=vps
ENV DEPLOY_TARGET=$DEPLOY_TARGET
# `npm run build` is `astro check && astro build` — the type check stays in the
# image build deliberately, so a broken build fails here rather than deploying.
RUN npm run build

FROM nginx:1.29-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
