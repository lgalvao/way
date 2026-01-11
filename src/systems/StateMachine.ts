import { InputState, FighterStateName } from '../types';

/**
 * Generic state interface for the FSM
 */
export interface State<T> {
  name: FighterStateName;
  owner: T;
  enter(): void;
  update(input: InputState, delta: number): void;
  exit(): void;
}

/**
 * Finite State Machine for fighter behavior
 */
export class StateMachine<T> {
  private states: Map<FighterStateName, State<T>> = new Map();
  private currentState: State<T> | null = null;

  addState(state: State<T>): void {
    this.states.set(state.name, state);
  }

  setState(name: FighterStateName): void {
    // Exit current state
    if (this.currentState) {
      this.currentState.exit();
    }

    // Enter new state
    const newState = this.states.get(name);
    if (!newState) {
      console.error(`State "${name}" not found!`);
      return;
    }

    this.currentState = newState;
    this.currentState.enter();
  }

  update(input: InputState, delta: number): void {
    if (this.currentState) {
      this.currentState.update(input, delta);
    }
  }

  getCurrentState(): FighterStateName | null {
    return this.currentState?.name ?? null;
  }

  isInState(name: FighterStateName): boolean {
    return this.currentState?.name === name;
  }
}
