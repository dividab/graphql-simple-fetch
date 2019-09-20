const { extractFiles: untyped } = require("extract-files");
const extractFiles: <T>(
  request: T
) => {
  clone: T;
  files: Map<File, [string]>;
} = untyped;

export interface RequestHeaders {
  readonly [key: string]: string;
}

export interface Options {
  method?: RequestInit["method"];
  headers?: RequestHeaders;
  mode?: RequestInit["mode"];
  credentials?: RequestInit["credentials"];
  cache?: RequestInit["cache"];
  redirect?: RequestInit["redirect"];
  referrer?: RequestInit["referrer"];
  referrerPolicy?: RequestInit["referrerPolicy"];
  integrity?: RequestInit["integrity"];
}

export interface Variables {
  readonly [key: string]: any;
}
export interface GraphQLError {
  message: string;
  locations: { line: number; column: number }[];
  path: string[];
}

export interface GraphQLResponse {
  data?: any;
  errors?: GraphQLError[];
  extensions?: any;
  status: number;
  [key: string]: any;
}

export interface GraphQLRequestContext {
  query: string;
  variables?: Variables;
}

export class ClientError extends Error {
  response: GraphQLResponse;
  request: GraphQLRequestContext;

  constructor(response: GraphQLResponse, request: GraphQLRequestContext) {
    const message = `${ClientError.extractMessage(response)}: ${JSON.stringify({
      response,
      request
    })}`;

    super(message);

    this.response = response;
    this.request = request;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, ClientError);
    }
  }

  private static extractMessage(response: GraphQLResponse): string {
    try {
      return response.errors![0].message;
    } catch (e) {
      return `GraphQL Error (Code: ${response.status})`;
    }
  }
}

export async function rawRequest<T extends any>(
  url: string,
  options: Options,
  query: string,
  variables?: Variables
): Promise<{
  data?: T;
  extensions?: any;
  headers: Headers;
  status: number;
  errors?: GraphQLError[];
}> {
  const { response, result } = await executeRequest(
    url,
    options,
    query,
    variables
  );

  if (response.ok && !result.errors && result.data) {
    const { headers, status } = response;
    return { ...result, headers, status };
  } else {
    const errorResult = typeof result === "string" ? { error: result } : result;
    throw new ClientError(
      { ...errorResult, status: response.status, headers: response.headers },
      { query, variables }
    );
  }
}

export async function request<T extends any>(
  url: string,
  options: Options,
  query: string,
  variables?: Variables
): Promise<T> {
  const { data } = await rawRequest(url, options, query, variables);

  return data;
}

interface ExecuteRequestResult {
  readonly response: any;
  readonly result: any;
}
async function executeRequest(
  url: string,
  options: Options,
  query: string,
  variables?: Variables
): Promise<ExecuteRequestResult> {
  const { headers, ...others } = options;

  const requestObject = {
    query,
    variables
  };

  const { clone, files } = extractFiles(requestObject);
  let response: Response;

  const operationBody = JSON.stringify(clone);

  if (files.size) {
    const form = new FormData();
    form.append("operations", operationBody);

    const map = {};
    let i = 0;
    files.forEach(paths => {
      map[++i] = paths;
    });
    form.append("map", JSON.stringify(map));

    i = 0;
    files.forEach((paths, file) => {
      form.append(`${++i}`, file, file.name);
    });

    response = await fetch(url, {
      method: "POST",
      headers: { ...headers },
      ...others,
      body: form
    });
  } else {
    response = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      ...others,
      body: operationBody
    });
  }

  const result = await getResult(response);

  return {
    response,
    result
  };
}

async function getResult(response: Response): Promise<any> {
  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.startsWith("application/json")) {
    return response.json();
  } else {
    return response.text();
  }
}
