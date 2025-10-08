# base image
FROM node:16

RUN apt-get update && apt-get install -y curl netcat

WORKDIR /app

COPY package*.json ./

# install dependencies
RUN npm install

COPY . .

# expose app port
EXPOSE 4000

CMD ["npm", "start"]
