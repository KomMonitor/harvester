FROM node:alpine
RUN mkdir -p /code
COPY . /code
WORKDIR /code
RUN npm install --production

#increase heap size to 4 GB
#ENV NODE_OPTIONS=--max_old_space_size=4096

EXPOSE 8089
CMD ["npm", "start"]
