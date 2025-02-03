import { promises as fs } from "fs";
import path from "path";

export interface TextLoadOptions {
  encoding?: BufferEncoding;
  maxSize?: number;
}

export async function loadTextFromFile(
  filePath: string,
  options: TextLoadOptions = {},
): Promise<string> {
  try {
    const {
      encoding = "utf-8",
      maxSize = 10 * 1024 * 1024, // 10MB padrão
    } = options;

    const absolutePath = path.resolve(filePath);

    await fs.access(absolutePath);

    const stats = await fs.stat(absolutePath);

    if (stats.size > maxSize) {
      throw new Error(`Arquivo excede o tamanho máximo de ${maxSize} bytes`);
    }

    const text = await fs.readFile(absolutePath, { encoding });

    if (!text.trim()) {
      throw new Error("Arquivo de texto está vazio");
    }

    return text;
  } catch (error) {
    console.error("Erro ao carregar arquivo:", error);
    throw error;
  }
}

export async function saveTextToFile(
  filePath: string,
  content: string,
): Promise<void> {
  try {
    const absolutePath = path.resolve(filePath);
    await fs.writeFile(absolutePath, content, "utf-8");
  } catch (error) {
    console.error("Erro ao salvar arquivo:", error);
    throw error;
  }
}
