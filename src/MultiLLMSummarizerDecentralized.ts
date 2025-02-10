import { Ollama } from "ollama";
import fs from "fs/promises";

interface Summary {
  model: string;
  summary: string;
}

class MultiLLMSummarizerDecentralized {
  private ollama: Ollama;
  private models: string[];
  private maxRounds: number;

  constructor(models: string[], maxRounds = 3) {
    this.ollama = new Ollama({ host: "http://localhost:11434" });
    this.models = models;
    this.maxRounds = maxRounds;
  }

  async generateSummaries(text: string): Promise<Summary[]> {
    console.log("Gerando resumos...");
    return await Promise.all(
      this.models.map(async (model) => {
        const prompt = `Faça um resumo conciso do texto a seguir em torno de 200 palavras. Forneça apenas o resumo do texto e nada mais. Texto original: ${text}`;
        try {
          const response = await this.ollama.generate({ model, prompt });

          const filePath = `./src/results/decentralized/generated-summary-${model}.txt`;
          await fs.writeFile(filePath, response.response, "utf-8");

          return { model, summary: response.response };
        } catch (error) {
          console.error(`Erro ao gerar resumo com ${model}:`, error);
          return { model, summary: `Erro ao gerar resumo com ${model}` };
        }
      }),
    );
  }

  async evaluateSummaries(
    originalText: string,
    summaries: Summary[],
  ): Promise<string> {
    const votes: Record<string, number> = {};

    await Promise.all(
      this.models.map(async (model) => {
        const prompt = `Dado o texto original e os resumos gerados por ${
          this.models.length
        } LLMs, escolha o melhor resumo sem justificar a escolha. Apenas forneça o nome do modelo do melhor resumo.
        ORIGINAL:
        ${originalText}
        ${summaries
          .map((s) => `Resumo de ${s.model}: ${s.summary}`)
          .join("\n")}`;

        try {
          const { response } = await this.ollama.generate({ model, prompt });
          votes[response] = (votes[response] || 0) + 1;
        } catch (error) {
          console.error(`Erro ao avaliar resumos com ${model}:`, error);
        }
      }),
    );

    const bestSummary = Object.keys(votes).reduce(
      (a, b) => (votes[a] > votes[b] ? a : b),
      "",
    );
    const consensusReached = votes[bestSummary] > this.models.length / 2;

    return consensusReached ? bestSummary : "Nenhum consenso alcançado";
  }

  async summarizeWithConsensus(text: string): Promise<string> {
    let summaries = await this.generateSummaries(text);

    for (let round = 0; round < this.maxRounds; round++) {
      const bestModel = await this.evaluateSummaries(text, summaries);
      if (bestModel !== "Nenhum consenso alcançado") {
        console.log(
          `Round ${round + 1}: Consenso alcançado com o modelo ${bestModel}`,
        );

        const filePath = `./src/results/decentralized/evaluation.txt`;
        await fs.writeFile(filePath, bestModel, "utf-8");

        return (
          summaries.find((s) => s.model === bestModel)?.summary ||
          "Erro ao encontrar o melhor resumo"
        );
      }
      console.log(
        `Round ${round + 1}: Nenhum consenso, gerando novos resumos...`,
      );
      summaries = await this.generateSummaries(text);
    }

    console.log("Número máximo de rodadas atingido, sem consenso.");
    console.log("Realizando desempate com um modelo independente...");

    const prompt =
      "Dado o texto inicial abaixo, junto com os resumos deste texto gerados por " +
      this.models.length +
      " LLMs, avalie os resumos gerados, dando como output o NOME da LLM que tem o melhor resumo e em uma linha separada o level de confiança entre 0 e 10.\n\nORIGINAL:\n" +
      text +
      "\n" +
      summaries
        .map(
          (summary) => `RESUMO de ${summary.model}:
      ${summary.summary}`,
        )
        .join("\n") +
      "\nLembre-se de dar como output apenas o nome da LLM que teve o melhor resumo e seu level de confiança entre 0 e 10";

    try {
      const { response } = await this.ollama.generate({
        model: "llama3.2",
        prompt,
      });

      console.log(
        "Resumos avaliados e salvo o melhor resumo, segundo a LLM classificadora!",
      );

      const filePath = `./src/results/decentralized/evaluation.txt`;
      await fs.writeFile(filePath, response, "utf-8");

      return response;
    } catch (error) {
      console.error("Erro ao avaliar resumos:", error);
      return "Erro ao avaliar resumos";
    }
  }
}

export { MultiLLMSummarizerDecentralized };
