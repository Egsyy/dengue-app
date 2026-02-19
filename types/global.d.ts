export {};

declare global {
  namespace React {
    interface HTMLAttributes<T> {
      slot?: string;
    }
    interface SVGProps<T> {
      slot?: string;
    }
  }
}
