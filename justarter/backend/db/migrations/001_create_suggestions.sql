-- Armazena os termos exibidos pelo autocomplete.
CREATE TABLE suggestions (
  -- Chave primária gerada automaticamente para cada sugestão.
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Texto com limite de 255 caracteres, que representa o termo sugerido.
  term VARCHAR(255) NOT NULL,
  -- Peso usado para ordenar as sugestões mais populares primeiro.
  popularity INTEGER NOT NULL DEFAULT 0,
  -- Data e hora de criação, armazenadas com informação de fuso horário.
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Impede o cadastro do mesmo termo mais de uma vez.
  CONSTRAINT suggestions_term_unique UNIQUE (term),
  -- Garante que a popularidade nunca seja negativa.
  CONSTRAINT suggestions_popularity_check CHECK (popularity >= 0)
);

-- Otimiza buscas por prefixo sem diferenciar letras maiúsculas de minúsculas,
-- como: WHERE lower(term) LIKE 'ação%'.
-- O operador text_pattern_ops permite que o B-tree seja usado com LIKE 'prefixo%'.
CREATE INDEX idx_suggestions_term_prefix
  ON suggestions (lower(term) text_pattern_ops);
