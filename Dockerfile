##Use the latest version of node image
FROM node:latest

##Create working directory on the container
WORKDIR /app

##Copy all files to the working directory
COPY . /app

##Install necessary packages
RUN npm install

##Expose port 3456
EXPOSE 3456

##Run the application when the container is started
CMD ["npm", "run", "app"]