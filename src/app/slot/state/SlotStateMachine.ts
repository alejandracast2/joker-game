export type SlotState = "idle" | "spinning" | "counting" | "feature";

type Listener = (next: SlotState, previous: SlotState) => void;

/**
 * Extremely small state machine to keep slot flow predictable.
 */
export class SlotStateMachine {
  private state: SlotState = "idle";
  private readonly listeners = new Set<Listener>();

  public get current(): SlotState {
    return this.state;
  }

  public setState(next: SlotState) {
    if (next === this.state) return;
    const previous = this.state;
    this.state = next;
    for (const listener of this.listeners) {
      listener(next, previous);
    }
  }

  public onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
