import { engine } from "../../getEngine";
import { delay } from "../../utils/delay";
import type { ReelManager, SlotMatrix } from "../reels/ReelManager";
import type {
  ResultEvaluator,
  EvaluationResult,
} from "../paytable/ResultEvaluator";
import { SLOT_PAYTABLE } from "../paytable/Paytable";
import type { SlotStateMachine } from "../state/SlotStateMachine";

export interface SpinControllerOptions {
  reelManager: ReelManager;
  evaluator: ResultEvaluator;
  stateMachine: SlotStateMachine;
}

/**
 * Centralises the orchestration of reel animations, state transitions and sounds.
 */
export class SpinController {
  private readonly reelManager: ReelManager;
  private readonly evaluator: ResultEvaluator;
  private readonly stateMachine: SlotStateMachine;

  constructor(options: SpinControllerOptions) {
    this.reelManager = options.reelManager;
    this.evaluator = options.evaluator;
    this.stateMachine = options.stateMachine;
  }

  public async startSpin(bet: number): Promise<EvaluationResult> {
    this.stateMachine.setState("spinning");
    engine().audio.sfx.play("main/sounds/sfx-hover.wav");

    const matrix = this.generateResultMatrix();
    const evaluation = this.evaluator.evaluate(matrix, bet);

    await this.reelManager.spinTo(matrix, {
      perReelDelay: 180,
      cycles: 5,
      stepDuration: 100,
    });

    await delay(250);
    engine().audio.sfx.play("main/sounds/sfx-press.wav");
    this.stateMachine.setState("counting");

    return evaluation;
  }

  public async finishCounting() {
    await delay(600);
    this.stateMachine.setState("idle");
  }

  public getCurrentMatrix(): SlotMatrix {
    return this.reelManager.getVisible();
  }

  private generateResultMatrix(): SlotMatrix {
    return this.reelManager.generateRandomMatrix().map((column) =>
      column.map((symbol) => {
        // Use WILD as occasional replacement to create more frequent small wins.
        if (Math.random() < 0.08) {
          return SLOT_PAYTABLE.symbols[0];
        }
        return symbol;
      }),
    );
  }
}
