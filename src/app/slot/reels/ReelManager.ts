import { Container } from "pixi.js";

import type { SlotPaytable, SymbolDefinition } from "../paytable/Paytable";
import { Reel } from "./Reel";

export interface ReelManagerOptions {
  reels: number;
  rows: number;
  symbolSize: number;
  rowSpacing: number;
  reelSpacing: number;
  padding: number;
  paytable: SlotPaytable;
}

export interface SpinLayoutOptions {
  perReelDelay?: number;
  cycles?: number;
  stepDuration?: number;
}

export type SlotMatrix = SymbolDefinition[][];

/**
 * Manages the creation and update of all reels in the game.
 */
export class ReelManager extends Container {
  private readonly reels: Reel[] = [];
  private readonly options: ReelManagerOptions;

  constructor(options: ReelManagerOptions) {
    super();
    this.options = options;

    for (let reelIndex = 0; reelIndex < options.reels; reelIndex++) {
      const reel = new Reel({
        rows: options.rows,
        size: options.symbolSize,
        padding: options.padding,
        availableSymbols: options.paytable.symbols,
      });
      reel.layout(options.rowSpacing);
      reel.x =
        reelIndex *
        (options.symbolSize + options.reelSpacing + options.padding * 2);
      this.reels.push(reel);
      this.addChild(reel);
    }
  }

  public getSize() {
    const width =
      this.options.reels *
        (this.options.symbolSize + this.options.padding * 2) +
      (this.options.reels - 1) * this.options.reelSpacing;
    const height = this.reels[0]?.reelHeight ?? 0;
    return { width, height };
  }

  public async spinTo(result: SlotMatrix, layout: SpinLayoutOptions = {}) {
    const { perReelDelay = 120, cycles = 4, stepDuration = 90 } = layout;

    const promises = this.reels.map((reel, index) =>
      reel.spinTo(result[index], {
        delay: index * perReelDelay,
        cycles,
        stepDuration,
      }),
    );

    await Promise.all(promises);
  }

  public getVisible(): SlotMatrix {
    return this.reels.map((reel) => reel.getVisibleDefinitions());
  }

  public generateRandomMatrix(): SlotMatrix {
    return this.reels.map(() => this.pickRandomColumn());
  }

  private pickRandomColumn(): SymbolDefinition[] {
    const result: SymbolDefinition[] = [];
    const { rows, paytable } = this.options;
    for (let index = 0; index < rows; index++) {
      const symbol =
        paytable.symbols[Math.floor(Math.random() * paytable.symbols.length)];
      result.push(symbol);
    }
    return result;
  }
}
