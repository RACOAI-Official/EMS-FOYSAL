FROM node:18-alpine

# Install build dependencies for native modules (e.g. bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5500

CMD ["npm", "start"]
