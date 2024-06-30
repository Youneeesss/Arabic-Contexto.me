FROM node:14

WORKDIR /app

COPY . /app

RUN npm install

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
