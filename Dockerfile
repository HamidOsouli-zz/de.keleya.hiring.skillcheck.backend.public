FROM node:12.19.0 as builder

WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx prisma db seed
RUN npx prisma migrate dev
RUN npm run build

FROM node:12.19.0 as runner
WORKDIR /app
COPY --from=builder /app /app
RUN ls -la
CMD ["npm", "run", "start:prod"]