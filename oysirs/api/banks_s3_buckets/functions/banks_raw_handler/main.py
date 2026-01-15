from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.utilities.data_classes import event_source, S3Event
import os
import boto3


banks_bucket = os.environ['BANKS_BUCKET_NAME']
banks_raw_bucket = os.environ['BANKS_RAW_BUCKET_NAME']
CLUSTER_ARN = os.environ['CLUSTER_ARN']
TASK_DEFINITION_ARN = os.environ['TASK_DEFINITION_ARN']
SUBNETS = os.environ['SUBNETS'].split(',')
ANALYZE_CONTAINER_NAME = os.environ['ANALYZE_CONTAINER_NAME']
SECURITY_GROUPS = os.environ['SECURITY_GROUPS'].split(',')

ecs_client = boto3.client('ecs')

logger = Logger()
tracer = Tracer()

@event_source(data_class=S3Event)
@logger.inject_lambda_context
@tracer.capture_lambda_handler
def handler(event: S3Event, context: LambdaContext):
    logger.info("Lambda handler started")
    for record in event.records:
        bucket_name = record.s3.bucket.name
        object_key = record.s3.get_object.key
        logger.info(f"Processing file {object_key} from bucket {bucket_name}")
        response = ecs_client.run_task(
            cluster=CLUSTER_ARN,
            launchType='FARGATE',
            taskDefinition=TASK_DEFINITION_ARN,
            platformVersion='LATEST',
            count=1,
            networkConfiguration={
                'awsvpcConfiguration': {
                    'subnets': SUBNETS,
                    'assignPublicIp': 'ENABLED',  # or 'DISABLED' for private subnets
                    'securityGroups': SECURITY_GROUPS,
                }
            },
            overrides={
                'containerOverrides': [
                    {
                        'name': ANALYZE_CONTAINER_NAME,
                        'environment': [
                            {'name': 'BUCKET_NAME', 'value': bucket_name},
                            {'name': 'OBJECT_KEY', 'value': object_key},
                        ],
                    },
                ],
            },
        )
        logger.info(f"Started ECS task for file {object_key}: {response['tasks'][0]['taskArn']}")
        