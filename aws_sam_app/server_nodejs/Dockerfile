FROM public.ecr.aws/lambda/nodejs:18-arm64 as builder

WORKDIR /usr/app

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build


FROM public.ecr.aws/lambda/nodejs:18-arm64

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /usr/app ./
CMD ["dist/index.handler"]
