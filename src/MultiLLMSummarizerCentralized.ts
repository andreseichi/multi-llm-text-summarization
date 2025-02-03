import { Ollama } from "ollama";

interface Summary {
  model: string;
  summary: string;
  score?: number;
}

class MultiLLMSummarizerCentralized {
  private ollama: Ollama;
  private models: string[];

  constructor(models: string[]) {
    this.ollama = new Ollama({ host: "http://localhost:11434" });
    this.models = models;
  }

  async generateSummaries(text: string): Promise<Summary[]> {
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
    return summaries;
  }

  async evaluateSummaries(
    originalText: string,
    summaries: Summary[],
  ): Promise<string> {
    const prompt =
      "Dado o texto inicial abaixo, junto com os resumos deste texto gerados por " +
      this.models.length +
      " LLMs, por favor avalie os resumos gerados e dê o nome da LLM que tem o melhor resumo. Em uma linha separada indique o level de confiança entre 0 e 10.\nORIGINAL:\n" +
      originalText +
      "\n" +
      summaries
        .map(
          (summary) => `RESUMO de ${summary.model}:
        ${summary.summary}`,
        )
        .join("\n");

    try {
      const { response } = await this.ollama.generate({
        model: "deepseek-r1",
        prompt,
      });

      return response;
    } catch (error) {
      console.error("Erro ao avaliar resumos:", error);
      return "Erro ao avaliar resumos";
    }
  }
}

export { MultiLLMSummarizerCentralized };
