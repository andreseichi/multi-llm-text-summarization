import { Ollama } from "ollama";
import fs from "fs/promises";

interface Summary {
  model: string;
  summary: string;
}

class MultiLLMSummarizerCentralized {
  private ollama: Ollama;
  private models: string[];

  constructor(models: string[]) {
    this.ollama = new Ollama({ host: "http://localhost:11434" });
    this.models = models;
  }

  async generateSummaries(text: string): Promise<Summary[]> {
    console.log();
    console.log("Gerando resumos...");
    const summaries = await Promise.all(
      this.models.map(async (model) => {
        const prompt =
          "Faça um resumo consiso do texto a seguir em torno de 200 palavras. Forneça apenas o resumo do texto e nada mais. Texto original: " +
          text;

        try {
          const response = await this.ollama.generate({
            model,
            prompt,
          });

          const filePath = `./src/results/centralized/generated-summary-${model}.txt`;
          await fs.writeFile(filePath, response.response, "utf-8");

          return {
            model,
            summary: response.response,
          };
        } catch (error) {
          console.error(`Erro ao gerar resumo com o modelo ${model}:`, error);
          return {
            model,
            summary: `Erro ao gerar resumo com ${model}`,
          };
        }
      }),
    );

    console.log("Resumos gerados e salvos!");

    return summaries;
  }

  async evaluateSummaries(
    originalText: string,
    summaries: Summary[],
  ): Promise<string> {
    const prompt =
      "Dado o texto inicial abaixo, junto com os resumos deste texto gerados por " +
      this.models.length +
      " LLMs, avalie os resumos gerados, dando como output o NOME da LLM que tem o melhor resumo e em uma linha separada o level de confiança entre 0 e 10.\n\nORIGINAL:\n" +
      originalText +
      "\n" +
      summaries
        .map(
          (summary) => `RESUMO de ${summary.model}:
        ${summary.summary}`,
        )
        .join("\n") +
      "\nLembre-se de dar como output apenas o nome da LLM que teve o melhor resumo e seu level de confiança entre 0 e 10";

    try {
      console.log("Avaliando resumos...");
      const { response } = await this.ollama.generate({
        model: "llama3.2",
        prompt,
      });

      console.log(
        "Resumos avaliados e salvo o melhor resumo, segundo a LLM classificadora!",
      );
      const filePath = `./src/results/centralized/evaluation.txt`;
      await fs.writeFile(filePath, response, "utf-8");

      return response;
    } catch (error) {
      console.error("Erro ao avaliar resumos:", error);
      return "Erro ao avaliar resumos";
    }
  }
}

export { MultiLLMSummarizerCentralized };
