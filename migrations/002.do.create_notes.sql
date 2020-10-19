CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE notes (
    id uuid PRIMARY KEY DEFAULT UUID_GENERATE_V4() NOT NULL,
    note_name TEXT NOT NULL,
    modified TIMESTAMPTZ DEFAULT now() NOT NULL,
    folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
    content TEXT NOT NULL
);