-- Disponibiliza a remoção de acentos para a busca por prefixo.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- O wrapper imutável permite utilizar unaccent em um índice funcional.
CREATE FUNCTION public.immutable_unaccent(value TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$
  SELECT public.unaccent('public.unaccent', value)
$$;

-- O índice anterior diferenciava "acao" de "ação" e deixou de ser necessário.
DROP INDEX idx_suggestions_term_prefix;

-- Mantém a busca por prefixo eficiente mesmo quando o termo é digitado sem acento.
CREATE INDEX idx_suggestions_term_prefix
  ON suggestions (lower(public.immutable_unaccent(term)) text_pattern_ops);
