// starter/suggestions.js 
// 
// Implementação inicial de referência para o handler de sugestões. 
// Você não é obrigada a usá-la — mas avalie este código no seu 
// COMMENTS.md antes de decidir: o que está bom, o que mudaria e por quê. 
 
async function fetchSuggestions(query, setSuggestions) { 
  if (query.length < 4) { 
    setSuggestions([]); 
    return; 
  } 
 
  const response = await fetch(`/graphql?q=${query}`, { 
    method: "GET", 
  }); 
 
  const data = await response.json(); 
  setSuggestions(data.suggestions.slice(0, 10)); 
} 
 
export default fetchSuggestions; 