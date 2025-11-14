from alembic.config import Config
from alembic import command
from aws_lambda_powertools.logging import Logger

logger = Logger()

def handler(event, context):
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migration completed successfully.")
        return {
            'statusCode': 200,
            'body': 'Database migration completed successfully.'
        }
    except Exception as e:
        logger.error(f"Database migration failed: {e}")
        raise e

if __name__ == "__main__":
    res = handler(None, None)
    print(res)