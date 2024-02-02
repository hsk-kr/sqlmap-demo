FROM bitnami/git:latest as git

WORKDIR /app
RUN git clone --depth 1 https://github.com/sqlmapproject/sqlmap.git .

FROM python:latest as python

COPY --from=git /app /app

WORKDIR /app
ENTRYPOINT python sqlmap.py -u "http://host.docker.internal:3000/auth/sign-up" --data='{"username": "*", "password": "*"}' --dbs --level=5 --risk=3
# ENTRYPOINT python sqlmap.py -u "http://host.docker.internal:3000/todos" --headers="Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcwNjkwOTg2MywiZXhwIjoxNzA2OTEwNzYzfQ.PCzoBiRVw7NNerYFamBtnTTnmfckfguc4ns3YQRPPKc" --data='{"content": "*"}' --dbs --level=5 --risk=3