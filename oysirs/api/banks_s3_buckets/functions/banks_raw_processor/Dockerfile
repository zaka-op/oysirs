FROM python:3.12-slim AS builder
WORKDIR /app
COPY . .
RUN mkdir -p bundle/layers
RUN mkdir -p bundle/function
COPY oysirs/shared/layers bundle/layers/
COPY oysirs/api/banks_s3_buckets/functions/banks_raw_processor bundle/function/

FROM python:3.12-slim AS final
WORKDIR /app
COPY --from=builder /app/bundle .
RUN python -m pip install --upgrade pip
RUN python -m pip install --upgrade -r layers/common/requirements.txt
RUN python -m pip install --upgrade ./layers/python_sdk/internal
RUN python -m pip install --upgrade aws-lambda-powertools[all]
RUN rm -rf layers
CMD ["python", "function/main.py"]