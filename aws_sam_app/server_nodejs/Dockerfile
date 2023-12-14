# ANCHOR: Builder

FROM public.ecr.aws/lambda/nodejs:18-arm64 as builder

WORKDIR /usr/app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install

COPY src ./src
RUN npm run build


# ANCHOR: Lambda

FROM public.ecr.aws/lambda/nodejs:18-arm64

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /usr/app ./
CMD ["dist/index.handler"]
