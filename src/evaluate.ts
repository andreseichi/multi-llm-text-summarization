import fs from "fs/promises";
import { loadTextFromFile } from "./loadText";
import TextEvaluationMetrics from "./TextEvaluationMetrics";

const generatedSummaryCentralizedPath =
  "./src/results/centralized/generated-summary-llama3.1.txt";
const generatedSummaryDecentralizedPath =
  "./src/results/decentralized/generated-summary-llama3.1.txt";
const referenceSummaryPath = "./src/texts/reference-2.txt";

const evaluateSummary = async (
  referencePath: string,
  candidatePath: string,
): Promise<string> => {
  try {
    const generatedSummary = await loadTextFromFile(referencePath);
    const referenceSummary = await loadTextFromFile(candidatePath);

    const rouge1 = TextEvaluationMetrics.calculateROUGE1(
      referenceSummary,
      generatedSummary,
    );
    const rougeL = TextEvaluationMetrics.calculateROUGEL(
      referenceSummary,
      generatedSummary,
    );
    const bleu1 = TextEvaluationMetrics.calculateBLEU1(
      referenceSummary,
      generatedSummary,
    );
    const bleu4 = TextEvaluationMetrics.calculateBLEU4(
      referenceSummary,
      generatedSummary,
    );

    const template =
      "ROUGE-1: " +
      rouge1.precision +
      "\n" +
      "ROUGE-L: " +
      rougeL.precision +
      "\n" +
      "BLEU-1: " +
      bleu1 +
      "\n" +
      "BLEU-4: " +
      bleu4 +
      "\n";

    return template;
  } catch (error) {
    console.error("Error during evaluation:", error);
    return "";
  }
};

const main = async (): Promise<void> => {
  // centralized
  const templateCentralized = await evaluateSummary(
    referenceSummaryPath,
    generatedSummaryCentralizedPath,
  );
  const filePathCentralized = `./src/results/centralized/metrics.txt`;
  await fs.writeFile(filePathCentralized, templateCentralized, "utf-8");

  // decentralized
  const templateDecentralized = await evaluateSummary(
    referenceSummaryPath,
    generatedSummaryDecentralizedPath,
  );
  const filePathDecentralized = `./src/results/decentralized/metrics.txt`;
  await fs.writeFile(filePathDecentralized, templateDecentralized, "utf-8");
};

main();
