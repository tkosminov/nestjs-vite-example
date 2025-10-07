export function addToREPLContext(data: Record<string, object>) {
  Object.assign(global, data);
}

export function addGetterToREPLContext(data: Record<string, () => object>) {
  Object.entries(data).forEach(([name, func]) => {
    Object.defineProperty(global, name, {
      enumerable: true,
      get: func,
    });
  });
}
