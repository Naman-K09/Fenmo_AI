-- 003_seed_default_categories.sql
INSERT INTO categories (name) VALUES
    ('Food'),
    ('Transport'),
    ('Housing'),
    ('Entertainment'),
    ('Healthcare'),
    ('Shopping'),
    ('Utilities'),
    ('Education'),
    ('Travel'),
    ('Other')
ON CONFLICT (name) DO NOTHING;