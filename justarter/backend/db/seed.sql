INSERT INTO suggestions (term) VALUES
  ('react'),
  ('reactive'),
  ('reactor'),
  ('reality'),
  ('reason'),
  ('recipe'),
  ('redesign'),
  ('redis'),
  ('recruit'),
  ('recuperar'),
  ('router'),
  ('runtime'),
  ('rural'),
  ('rush'),
  ('ruby')
ON CONFLICT (term) DO NOTHING;
