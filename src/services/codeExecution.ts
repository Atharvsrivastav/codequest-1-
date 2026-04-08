/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const JUDGE0_API_URL = import.meta.env.VITE_JUDGE0_API_URL;
const JUDGE0_AUTH_TOKEN = import.meta.env.VITE_JUDGE0_AUTH_TOKEN;

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}

export const codeExecutionService = {
  async executeCode(sourceCode: string, languageId: number): Promise<ExecutionResult> {
    if (!JUDGE0_API_URL || !JUDGE0_AUTH_TOKEN) {
      throw new Error("Judge0 API configuration is missing.");
    }

    const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_AUTH_TOKEN,
        'X-RapidAPI-Host': new URL(JUDGE0_API_URL).hostname
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
      })
    });

    if (!response.ok) {
      throw new Error(`Execution failed: ${response.statusText}`);
    }

    return await response.json();
  }
};
