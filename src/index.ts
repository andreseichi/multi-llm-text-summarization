import { loadTextFromFile } from "./loadText";
import { MultiLLMSummarizerCentralized } from "./MultiLLMSummarizerCentralized";
import { MultiLLMSummarizerDecentralized } from "./MultiLLMSummarizerDecentralized";

const textPath = "./src/texts/text2.txt";

const models = ["llama3.1", "llama2", "stablelm2"];
const main = async (): Promise<void> => {
  const text = await loadTextFromFile(textPath);

  console.log("Topologia Centralizada");
  const summarizer = new MultiLLMSummarizerCentralized(models);

  const results = await summarizer.generateSummaries(text);

  await summarizer.evaluateSummaries(text, results);

  console.log("Topologia Descentralizada");
  const summarizerDecentralized = new MultiLLMSummarizerDecentralized(models);

  await summarizerDecentralized.summarizeWithConsensus(text);
};

main();
