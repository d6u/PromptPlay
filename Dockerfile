FROM public.ecr.aws/docker/library/python:3.11.4

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY .env .env
COPY .env.production.local .env.local

COPY server server

CMD [ "uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000" ]
