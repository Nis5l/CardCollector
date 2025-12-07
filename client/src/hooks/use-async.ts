import { useEffect } from "react";

export function useAsync(asyncFn: () => Promise<unknown>, onSuccess: (data: unknown) => void): void {
    useEffect(() => {
      let isActive = true;
      asyncFn().then((data: unknown) => {
        if (isActive) onSuccess(data);
      });
      return () => { isActive = false };
    }, [asyncFn, onSuccess]);
}

export const withAsync = (asyncFn: () => Promise<unknown>, onSuccess: (data: unknown) => void) => {
    return () => {
        useAsync(asyncFn, onSuccess);
    }
}
