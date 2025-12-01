FROM node:lts-alpine AS builder
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm ci --silent || npm install --silent
COPY . .
RUN npm run build

FROM node:lts-alpine AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# Install only production dependencies for smaller runtime image
RUN npm ci --omit=dev --silent || npm install --omit=dev --silent
# Copy compiled app
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 3000
USER node
CMD ["npm", "start"]
