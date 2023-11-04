FROM public.ecr.aws/lambda/nodejs:18-arm64 as builder
WORKDIR /usr/app
COPY package.json src/index.js  ./
RUN npm install

FROM public.ecr.aws/lambda/nodejs:18-arm64
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/* ./
CMD ["src/index.handler"]
