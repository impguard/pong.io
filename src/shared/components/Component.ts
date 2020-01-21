/**
 * An abstraction for every component class.
 * 
 * For the most part, this just guarantees that every component class implement
 * the ability to synchronize itself given a state object representing it and
 * snapshot itself when asked.
 */
export default abstract class Component {
  abstract sync(state: any): void;
  abstract snapshot(): any;
}