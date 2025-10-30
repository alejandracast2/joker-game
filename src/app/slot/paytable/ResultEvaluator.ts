import type { Payline, SlotPaytable, SymbolDefinition } from "./Paytable";
import type { SlotMatrix } from "../reels/ReelManager";

export interface LineWin {
  line: Payline;
  symbol: SymbolDefinition;
  count: number;
  win: number;
}

export interface EvaluationResult {
  totalWin: number;
  lineWins: LineWin[];
  matrix: SlotMatrix;
}

/**
 * Determines winning lines and payout amounts for a slot result.
 */
export class ResultEvaluator {
  constructor(private readonly paytable: SlotPaytable) {}

  public evaluate(matrix: SlotMatrix, bet: number): EvaluationResult {
    const wins: LineWin[] = [];

    for (const line of this.paytable.paylines) {
      const sequence = matrix.map(
        (column, reelIndex) => column[line.pattern[reelIndex]],
      );

      const lineWin = this.calculateLineWin(line, sequence, bet);
      if (lineWin) {
        wins.push(lineWin);
      }
    }

    const totalWin = wins.reduce((acc, current) => acc + current.win, 0);

    return {
      totalWin,
      lineWins: wins,
      matrix,
    };
  }

  private calculateLineWin(
    line: Payline,
    sequence: SymbolDefinition[],
    bet: number,
  ): LineWin | undefined {
    const [firstSymbol, ...rest] = sequence;
    if (!firstSymbol) {
      return undefined;
    }

    let count = 1;
    for (const symbol of rest) {
      if (symbol.id === firstSymbol.id || firstSymbol.id === "WILD") {
        count++;
      } else if (symbol.id === "WILD") {
        count++;
      } else {
        break;
      }
    }

    const payout = firstSymbol.payouts[count];
    if (!payout) {
      return undefined;
    }

    return {
      line,
      symbol: firstSymbol,
      count,
      win: payout * bet,
    };
  }
}
