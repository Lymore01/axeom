export interface AxiomValidationError {
  path: (string | number)[];
  message: string;
  code: string;
  metadata?: any;
}

export function createRegex(path: string, paramNames: string[] = []) {
  const regexSource = path
    .replace(/\//g, "\\/")
    .replace(/:([^/]+)/g, (_, name) => {
      if (!paramNames.includes(name)) paramNames.push(name);
      return "([^/]+)";
    })
    .replace(/\*/g, () => {
      if (!paramNames.includes("*")) paramNames.push("*");
      return "(.*)";
    });

  return new RegExp(`^${regexSource}$`);
}

export function formatValidationError(error: any): AxiomValidationError[] {
  const issues = error.issues || [];

  if (Array.isArray(issues) && issues.length > 0) {
    return issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
      code: issue.code,
      metadata: issue.expected
        ? {
            expected: issue.expected,
            received: issue.received,
          }
        : undefined,
    }));
  }
  return [
    {
      path: ["_form"],
      message: error.message || "Unknown validation error",
      code: "custom",
    },
  ];
}
