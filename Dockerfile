##Use the latest version of node image
FROM node:latest

##Create working directory on the container
WORKDIR /app

##Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

##Install necessary packages
RUN npm install

##Copy all contents of src directory to the working directory
COPY ./src .

##Expose port 3456
EXPOSE 3456

##Run the application when the container is started
CMD ["npm", "run", "app"]