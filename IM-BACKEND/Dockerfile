#builder Use Node.js 18
FROM node:18

RUN apt-get update && \
    apt-get install -y python3-pip build-essential ffmpeg

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Copy source and build
COPY . .

RUN npm install --legacy-peer-deps

RUN npm run build

# Expose port and set environment
ENV PORT=6600
EXPOSE 6600

# Start the application
CMD ["npm", "run", "server"]