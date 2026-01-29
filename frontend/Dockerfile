FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Set environment variable to allow legacy OpenSSL provider if needed (common in React 17/18)
ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npm", "start"]
