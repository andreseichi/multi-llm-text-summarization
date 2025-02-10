Multi-LLM Text Summarization

Projeto de criação de resumos de textos longos, usando duas topologias:

- Centralizada
- Descentralizada


1 - É necessário fornecer o texto a ser avaliado pelos modelos no path `src/texts` e também um arquivo 
do resumo original deste texto, caso exista, para realizar métricas e avaliar a performance dos modelos e as topologias.
O caminho do arquivo deve ser fornecido no `src/index.ts`: 

`const textPath = "./src/texts/text.txt";`

2 - Ao rodar o script principal, com npm, yarn ou semelhante, `npm start`, o script principal irá executar as topologias
centralizadas e descentralizadas, e salvar os resultados na pasta `src/results`



3 - Para avaliação de métricas, deve ser modificado o caminho desses resultados no arquivo `evaluate.ts` para fornecer 
o melhor resumo avaliado e então rodar o script `npm metrics` e será gerado um arquivo de métricas `metrics.txt`
nos caminhos `src/results/centralized` e `src/results/decentralized`