FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

ENV NODE_ENV=development

RUN npm ci --include=dev

COPY . ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
