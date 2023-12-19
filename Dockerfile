FROM node:gallium-alpine
WORKDIR /opt/webapptemplate
ENV NODE_ENV=production
COPY build/ .
RUN npm i
EXPOSE 3000
CMD ["npm", "start"]

