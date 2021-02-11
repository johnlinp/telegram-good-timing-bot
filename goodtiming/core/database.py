import os
import psycopg2


class DatabaseUniqueViolation(Exception):
    pass


class Database:
    def execute(self, query, variables):
        def execute_with_cursor(cursor):
            cursor.execute(query, variables)
        def execute_with_error_convert():
            self.with_cursor(execute_with_cursor)

        self.with_error_convert(execute_with_error_convert)

    def with_cursor(self, func):
        with psycopg2.connect(os.environ.get('DATABASE_URL')) as connection:
            with connection.cursor() as cursor:
                return func(cursor)

    def with_error_convert(self, func):
        try:
            return func()
        except psycopg2.Error as e:
            if isinstance(e, psycopg2.errors.UniqueViolation):
                raise DatabaseUniqueViolation()
            else:
                raise e
