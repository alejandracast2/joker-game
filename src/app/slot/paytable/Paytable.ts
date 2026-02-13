export interface SymbolDefinition {
  id: string;
  label: string;
  color: number;
  payouts: Record<number, number>;
}

export interface Payline {
  /** Index of the row to pick for each reel */
  pattern: number[];
  name: string;
}

export interface SlotPaytable {
  symbols: SymbolDefinition[];
  paylines: Payline[];
}

export const SLOT_PAYTABLE: SlotPaytable = {
  symbols: [
    {
      id: "WILD",
      label: "★",
      color: 0xf4b83a,
      payouts: {
        3: 10,
        4: 30,
        5: 100,
      },
    },
    {
      id: "A",
      label: "A",
      color: 0xe74c3c,
      payouts: {
        3: 6,
        4: 16,
        5: 50,
      },
    },
    {
      id: "K",
      label: "K",
      color: 0x8e44ad,
      payouts: {
        3: 5,
        4: 12,
        5: 40,
      },
    },
    {
      id: "Q",
      label: "Q",
      color: 0x3498db,
      payouts: {
        3: 4,
        4: 10,
        5: 30,
      },
    },
    {
      id: "J",
      label: "J",
      color: 0x1abc9c,
      payouts: {
        3: 3,
        4: 8,
        5: 24,
      },
    },
    {
      id: "10",
      label: "10",
      color: 0xf39c12,
      payouts: {
        3: 2,
        4: 6,
        5: 20,
      },
    },
  ],
  paylines: [
    { name: "Line 1", pattern: [1, 1, 1, 1, 1] },
    { name: "Line 2", pattern: [0, 0, 0, 0, 0] },
    { name: "Line 3", pattern: [2, 2, 2, 2, 2] },
    { name: "Line 4", pattern: [0, 1, 2, 1, 0] },
    { name: "Line 5", pattern: [2, 1, 0, 1, 2] },
  ],
};

export function getSymbolDefinition(id: string): SymbolDefinition | undefined {
  return SLOT_PAYTABLE.symbols.find((symbol) => symbol.id === id);
}
