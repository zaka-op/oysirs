import os
from sqlalchemy import URL


def get_database_url() -> URL | None:
    db_driver = os.getenv("DATABASE_DRIVER", "postgresql+psycopg2")
    db_username = os.getenv('DATABASE_USERNAME')
    db_password = os.getenv('DATABASE_PASSWORD')
    db_host = os.getenv('DATABASE_HOST')
    db_port = os.getenv('DATABASE_PORT')
    db_name = os.getenv('DATABASE_NAME')

    if all((db_username, db_password, db_host, db_port, db_name)):
        return URL.create(
            drivername=db_driver,
            username=db_username,
            password=db_password,
            host=db_host,
            port=db_port,
            database=db_name
        )
    return None