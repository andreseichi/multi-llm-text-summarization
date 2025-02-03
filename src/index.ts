import { loadTextFromFile } from "./loadText";
import { MultiLLMSummarizerCentralized } from "./MultiLLMSummarizerCentralized";

const textPath = './src/text.txt'

const main = async (): Promise<void> => {
  const models = ["llama3.1", "llama3.2"];

  const summarizer = new MultiLLMSummarizerCentralized(models);

  const text = await loadTextFromFile(textPath);

  const results = await summarizer.generateSummaries(text);

  console.log({ results });

  const evaluatedSummaries = await summarizer.evaluateSummaries(text, results);

  console.log({ evaluatedSummaries });
};

main();
