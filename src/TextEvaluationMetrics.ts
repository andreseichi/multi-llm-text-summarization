class TextEvaluationMetrics {
  static getNGrams(text: string, n: number) {
    const words = text.toLowerCase().split(" ");
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(" "));
    }
    return ngrams;
  }

  static countOccurrences(arr: any[]) {
    return arr.reduce((acc: { [x: string]: any }, curr: string | number) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
  }

  // ROUGE-1
  static calculateROUGE1(reference: string, candidate: string) {
    const refGrams = this.getNGrams(reference, 1);
    const candGrams = this.getNGrams(candidate, 1);

    const refCount = this.countOccurrences(refGrams);
    const candCount = this.countOccurrences(candGrams);

    let matches = 0;
    for (const gram in candCount) {
      if (refCount[gram]) {
        matches += Math.min(candCount[gram], refCount[gram]);
      }
    }

    const recall = matches / refGrams.length;
    const precision = matches / candGrams.length;
    const f1 = (2 * precision * recall) / (precision + recall || 1);

    return {
      precision,
      recall,
      f1,
    };
  }

  // ROUGE-L (Longest Common Subsequence)
  static calculateROUGEL(reference: string, candidate: string) {
    const refWords = reference.toLowerCase().split(" ");
    const candWords = candidate.toLowerCase().split(" ");

    const lcs = Array(refWords.length + 1)
      .fill(0)
      .map(() => Array(candWords.length + 1).fill(0));

    for (let i = 1; i <= refWords.length; i++) {
      for (let j = 1; j <= candWords.length; j++) {
        if (refWords[i - 1] === candWords[j - 1]) {
          lcs[i][j] = lcs[i - 1][j - 1] + 1;
        } else {
          lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
        }
      }
    }

    const lcsLength = lcs[refWords.length][candWords.length];
    const recall = lcsLength / refWords.length;
    const precision = lcsLength / candWords.length;
    const f1 = (2 * precision * recall) / (precision + recall || 1);

    return {
      precision,
      recall,
      f1,
    };
  }

  // BLEU-1
  static calculateBLEU1(reference: string, candidate: string) {
    const refGrams = this.getNGrams(reference, 1);
    const candGrams = this.getNGrams(candidate, 1);

    const refCount = this.countOccurrences(refGrams);
    const candCount = this.countOccurrences(candGrams);

    let matches = 0;
    for (const gram in candCount) {
      if (refCount[gram]) {
        matches += Math.min(candCount[gram], refCount[gram]);
      }
    }

    const precision = matches / candGrams.length;
    return precision;
  }

  // BLEU-4
  static calculateBLEU4(reference: string, candidate: string) {
    let precisions = [];

    for (let n = 1; n <= 4; n++) {
      const refGrams = this.getNGrams(reference, n);
      const candGrams = this.getNGrams(candidate, n);

      const refCount = this.countOccurrences(refGrams);
      const candCount = this.countOccurrences(candGrams);

      let matches = 0;
      for (const gram in candCount) {
        if (refCount[gram]) {
          matches += Math.min(candCount[gram], refCount[gram]);
        }
      }

      const precision = candGrams.length > 0 ? matches / candGrams.length : 0;
      precisions.push(precision);
    }

    const geometricMean = Math.exp(
      precisions.reduce((sum, p) => sum + Math.log(p || 1e-10), 0) / 4,
    );

    const refWords = reference.split(" ").length;
    const candWords = candidate.split(" ").length;
    const brevityPenalty = Math.exp(Math.min(0, 1 - refWords / candWords));

    return brevityPenalty * geometricMean;
  }
}

export default TextEvaluationMetrics;
