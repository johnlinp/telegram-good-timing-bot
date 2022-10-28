FROM python:3.10.7

RUN apt update
RUN apt install --yes python3-dev gettext

RUN pip3 install pipenv

COPY Pipfile /app/
COPY Pipfile.lock /app/
COPY .env /app/
COPY app.py /app/
COPY goodtiming /app/goodtiming
COPY bin /app/bin

WORKDIR /app

RUN pipenv install

RUN /app/bin/post_compile

ENTRYPOINT ["pipenv", "run", "python3", "app.py"]
