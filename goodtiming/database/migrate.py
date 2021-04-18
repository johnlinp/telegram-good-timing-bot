#!/usr/bin/env python3

import os
import sys
import pathlib
import psycopg2


def main():
    all_migrate_filenames = load_all_migrate_filenames()
    print(f'all migrates: {all_migrate_filenames}')

    create_version_control_table()
    done_migrate_filenames = load_done_migrate_filenames()
    print(f'done migrates: {done_migrate_filenames}')

    for migrate_filename in all_migrate_filenames:
        if migrate_filename in done_migrate_filenames:
            print(f'skipping migrate: {migrate_filename}')
            continue
        print(f'running migrate: {migrate_filename}')
        run_migrate(migrate_filename)
        mark_done_migrate(migrate_filename)

    print('migrate finished')


def create_version_control_table():
    run_sql('''
CREATE TABLE IF NOT EXISTS version_control (
    done_migrate_filename VARCHAR(50) NOT NULL,
    PRIMARY KEY(done_migrate_filename)
);
    ''')


def load_done_migrate_filenames():
    rows = run_sql('''
SELECT done_migrate_filename FROM version_control;
    ''', fetch=True)
    return [row[0] for row in rows]


def load_all_migrate_filenames():
    pwd = pathlib.Path('.')
    filenames = [path.name for path in pwd.glob('migrate-*.sql')]
    return sorted(filenames)


def run_migrate(migrate_filename):
    with open(migrate_filename) as migrate_file:
        run_sql(migrate_file.read())


def mark_done_migrate(migrate_filename):
    run_sql(f"INSERT INTO version_control (done_migrate_filename) VALUES ('{migrate_filename}')")


def run_sql(query, fetch=False):
    with psycopg2.connect(os.environ.get('DATABASE_URL')) as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            if fetch:
                return cursor.fetchall()


if __name__ == '__main__':
    main()
    sys.exit(0)
